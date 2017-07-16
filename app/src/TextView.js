"use strict";

// Copyright 2015-2017 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License, version 3, as
// published by the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with m3 - Mobile Mind Mapper.  If not, see
// <http://www.gnu.org/licenses/>.

import {App} from './App';
import {m3App} from './main';
import {Sizer} from './Sizer';

const MAX_WIDTH = 400;
const SVGNS = "http://www.w3.org/2000/svg";

/**
 * A TextView creates and maintains the SVG elements to show unformatted text
 * associated with a node text
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this bubble
 * @param {NodeModel} nodeModel - the NodeModel corresponding to this bubble
 */
export function TextView(nodeView, nodeModel) {
   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;
   this._characterHeight = 0;
   this._x = 0;    // Need to retain this for the width optimizer
   this._isVisible = true;

   //---------------------------------------------------------------------------
   // One-time creation of required html/svg elements
   //---------------------------------------------------------------------------
   this._svgText = document.createElementNS(SVGNS, "text");

   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .appendChild(this._svgText);

   //---------------------------------------------------------------------------
   // .bind() effectively produces a new function *each* time, thus can't use
   // .bind() once for creating the listener and once for removing it.
   // So keep it here for future reference when removing the listener
   //---------------------------------------------------------------------------
   this._boundClickListener = this._clickListener.bind(this);
   this._svgText.addEventListener("click", this._boundClickListener);

   //---------------------------------------------------------------------------
   // Now update with information from corresponding nodeModel
   //---------------------------------------------------------------------------
   this.update();

} // TextView()

/**
 * Listener function for this TextView
 * Note that 'this' must be bound to this TextView oject
 *
 * @return {void}
 */
TextView.prototype._clickListener = function _clickListener() {
   m3App.getController().getMapViewController().nodeClicked(this._myNodeView);
}; // _clickListener()

/**
 * Delete the svg object(s) corresponding to this text
 *
 * @return {void}
 */
TextView.prototype.deleteSvg = function deleteSvg() {
   this._svgText.removeEventListener("click", this._boundClickListener);
   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .removeChild(this._svgText);
}; // deleteSvg()

/**
 * Get the total height of this Text
 * @return {number} - Total height of this Text
 */
TextView.prototype.getHeight = function getHeight() {
   return this._svgText.getElementsByTagNameNS(SVGNS, 'tspan')
      .length*this._characterHeight;
}; // getHeight()

/**
 * Get the total width of this Text
 * @return {number} - Total width of this Text
 */
TextView.prototype.getWidth = function getWidth() {
   return this._svgText.getBBox().width;
}; // getWidth()

/**
 * Set the position of this Text
 * @param {number} x - x-coordinate of left edge of text
 * @param {number} y - y-coordinate of vertical middle of text
 * @return {void}
 */
TextView.prototype.setPosition = function setPosition(x, y) {
   let i;
   let newY;
   let tspans;

   //-------------------------------------------------------------------------
   // Note: Coords of svg text correspond to bottom left corner of the first
   //       <tspan>, thus need to shift up to center properly.
   //-------------------------------------------------------------------------
   tspans = this._svgText.getElementsByTagNameNS(SVGNS, 'tspan');
   newY = y + this.getHeight()/2 - (tspans.length-1) * this._characterHeight;

   for (i = 0; i < tspans.length; i++) {
      tspans[i].setAttribute('x', x);
      tspans[i].setAttribute('y', newY + this._characterHeight * i);
   }

   // When determining length of line that will fit within max width,
   // the tspans need to be positioned at the same x coordinate as the
   // enclosing <text> tag, to ensure width calculation is correct. So keep
   // a copy of it.
   this._x = x;

}; // setPosition()

/**
 * Make this Text visible or invisible
 * @param {boolean} visible - Make the Text visible (true) or not (false)
 * @return {void}
 */
TextView.prototype.setVisible = function setVisible(visible) {
   if (this._isVisible === visible) {
      return;
   }
   this._isVisible = visible;

   if (visible) {
      this._svgText.setAttribute("visibility", "visible");
   } else {
      this._svgText.setAttribute("visibility", "hidden");
   }
}; // setVisible()

/**
 * Update this RichText from the corresponding model
 * @return {void}
 */
TextView.prototype.update = function update() {
   //--------------------------------------------------------------------------
   // Set font attributes first so the width of the tspans will be correct for
   // the algorithm that splits lines.
   //--------------------------------------------------------------------------
   if (this._myNodeModel.getFont() === null) {
      this._svgText.setAttribute("font-size", "12");
      this._svgText.setAttribute("font-family", "verdana");
   } else {
      if (this._myNodeModel.getFont().isBold()) {
         this._svgText.setAttribute("font-weight", "bold");
      }

      if (this._myNodeModel.getFont().isItalic()) {
         this._svgText.setAttribute("font-style", "italic");
      }

      this._svgText.setAttribute("font-size",
                                 this._myNodeModel.getFont().getSize());
   }

   this._svgText.setAttribute("fill", this._myNodeModel.getTextColor());

   //--------------------------------------------------------------------------
   // Delete any existing tspans because modified text means the text in
   // the tspans and the number of tspans is likely to change.
   // Also, we'll be creating a tspan for determining character height,
   // and it must be the only tspan (so the height is correct).
   //--------------------------------------------------------------------------
   while (this._svgText.childNodes.length > 0) {
      this._svgText.removeChild(this._svgText.childNodes[0]);
   }

   this._characterHeight = this._getCharacterHeight();

   //--------------------------------------------------------------------------
   // Add the tspan(s) for each line of text
   //--------------------------------------------------------------------------
   this._myNodeModel.getText().forEach( (line) => {
      this._addTspans(line);
   });
}; // update()

/**
 * Add one or more tspans to our <text> tag for the specified line of text.
 * More than one tspan will be created if the line is longer than our max width.
 *
 * Use a binary search to find breakpoint for long lines.
 *
 * @param {string} text - The line of text
 *
 * @return {void}
 */
TextView.prototype._addTspans = function _addTspans(text) {
   // Pick a maximum width that will be suitable for the current
   // screen.
   const ADJUSTED_MAX_WIDTH = Math.min(MAX_WIDTH, 0.8 * Sizer.svgWidth);

   let lowLength;
   let highLength;
   let newTspan;
   let originalBreakLength;
   let testLength;
   let width;

   //-------------------------------------------------------------------------
   // Remove trailing whitespace because FireFox will exclude it for width
   // calculation if it's the last tspan (which it would be at this point), but
   // then *include* the space when another tspan is added after. This messes up
   // the algorithm below.
   //-------------------------------------------------------------------------
   text = text.replace(/\s*$/, '');

   newTspan = document.createElementNS(SVGNS, 'tspan');
   newTspan.appendChild(document.createTextNode(text));

   //-------------------------------------------------------------------------
   // Tspans must all have same x-coordinate as the enclosing <text> tag
   // so the width calculations below will be correct.
   //-------------------------------------------------------------------------
   newTspan.setAttribute('x', this._x);
   this._svgText.appendChild(newTspan);

   width = this._svgText.getBBox().width;
   if (width <= ADJUSTED_MAX_WIDTH) {
      return;
   }

   //-------------------------------------------------------------------------
   // Perform a binary search to find the longest length that will result
   // in the rendered text being <= ADJUSTED_MAX_WIDTH. After the magic length
   // is found,  ensure we're not breaking a word.
   //
   // Notes on this fiddly algorithm:
   //    - Remember arrays are zero-based, but lowLength, testLength, and
   //      are lengths
   //    - The loop terminates when lowLength + 1 = highLength
   //    - highLength is always too long, and you'd *think* that lowLength
   //      would always be too short. However, in the vast majority of cases,
   //      ADJUSTED_MAX_WIDTH will be in the middle of a letter, thus lowLength
   //      can end up being one character too long:
   //          - Depending on how the algorithm approaches the optimal number
   //            of characters, there's a chance that, due to above, lowIndex
   //            will actually be the *next* character, thus too long
   //          - Example:
   //             abcdefghijkl
   //               |   |    |
   //              low  test high
   //
   //          - If 'h' straddles the max width, then test is shorter than
   //            ADJUSTED_MAX_WIDTH, so algorithm will set low at 'h'
   //             abcdefghijkl
   //                    |   |
   //                   low  high
   //
   //          - But now low is too long, and will never go shorter because the
   //            algorithm always finds the midpoint between low and high
   //
   //    - The result of all this is that after the loop terminates, we have to
   //      check to see if we have to subtract one from low
   //-------------------------------------------------------------------------
   lowLength = 1;
   highLength = text.length - 1; // Not text.length because we already know it's
                                 // too long

   testLength = Math.floor((highLength - lowLength)/2) + lowLength;

   // Don't need to trim spaces because after the loop terminates, we ensure
   // word isn't split, and then set text again, at which point we'll trim.
   newTspan.childNodes[0].textContent = text.substr(0, testLength);
   width = this._svgText.getBBox().width;

   while (highLength - lowLength > 1) {
      if (width === ADJUSTED_MAX_WIDTH) {
         lowLength = testLength;
         highLength = testLength + 1;

      } else if (width < ADJUSTED_MAX_WIDTH) {
         // Too short, so search in the upper half
         lowLength = testLength + 1;

      } else {
         // Too long, so search in the lower half
         highLength = testLength - 1;
      }

      testLength = Math.floor((highLength - lowLength)/2) + lowLength;

      // As above, don't need to trim
      newTspan.childNodes[0].textContent = text.substr(0, testLength);
      width = this._svgText.getBBox().width;
   }

   // We've found the maximum length to fit in ADJUSTED_MAX_WIDTH, but as per
   // above, we might actually be one character too long.
   if (width > ADJUSTED_MAX_WIDTH && lowLength >1) {
      lowLength--;
   }

   // Save this breakpoint for case below where we don't find a clean word break
   originalBreakLength = lowLength;

   // Ensure we're not breaking a word, but check first to see if we got lucky.
   // If the character after our max length is a space, then we ended up at the
   // end of a word and there's no adjusting to be done.
   if (text[lowLength] !== ' ') {
      while (text[lowLength -1 ] !== ' ' && lowLength > 1) {
         lowLength--;
      }
   }

   // If we didn't find a word break, use the originally calculated length
   if (lowLength === 1) {
      lowLength = originalBreakLength;
   }

   // Trim the right side of whitespace because of Firefox issue re: width
   // calculations.
   newTspan.childNodes[0].textContent =
      text.substr(0, lowLength).replace(/\s*$/, '');

   // We've found the longest length possible, so add tspan(s) for the remaining
   // text. If our unadjusted length was the end of a word, then the next
   // character will be a space (which we don't want to start the next line, so
   // trim).
   this._addTspans(text.substr(lowLength).trim());
}; // _addTspans()

/**
 * Get the height of the current font using a big character.
 *
 * @return {number} The maximum height of text for the current font.
 */
TextView.prototype._getCharacterHeight = function _getCharacterHeight() {
   let height;
   let tempTspan;

   tempTspan = document.createElementNS(SVGNS, "tspan");
   tempTspan.appendChild(document.createTextNode('X'));
   this._svgText.appendChild(tempTspan);

   height = this._svgText.getBBox().height;
   this._svgText.removeChild(tempTspan);

   return height;
}; // _getCharacterHeight
