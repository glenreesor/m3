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

/**
 * A RichTextView creates and maintains the SVG elements to show HTML text
 * associated with a node text
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this RichText
 * @param {NodeModel} nodeModel - the NodeModel corresponding to this RichText
 */
export function RichTextView(nodeView, nodeModel) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;
   this._isVisible = true;

   //---------------------------------------------------------------------------
   // One-time creation of required svg element
   //---------------------------------------------------------------------------
   this._container = document.createElementNS(SVGNS, "foreignObject");
   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .appendChild(this._container);

   //---------------------------------------------------------------------------
   // .bind() effectively produces a new function *each* time, thus can't use
   // .bind() once for creating the listener and once for removing it.
   // So keep it here for future reference when removing the listener
   //---------------------------------------------------------------------------
   this._boundClickListener = this._clickListener.bind(this);
   this._container.addEventListener("click", this._boundClickListener);

   //---------------------------------------------------------------------------
   // Now update with information from corresponding nodeModel
   //---------------------------------------------------------------------------
   this.update();

} // RichTextView()

/**
 * Listener function for this RichTextView
 * Note that 'this' must be bound to this RichTextView oject
 *
 * @return {void}
 */
RichTextView.prototype._clickListener = function _clickListener() {
   m3App.getController().getMapViewController().nodeClicked(this._myNodeView);
}; // _clickListener()

/**
 * Delete the svg object(s) corresponding to this text
 *
 * @return {void}
 */
RichTextView.prototype.deleteSvg = function deleteSvg() {
   this._container.removeEventListener("click", this._boundClickListener);
   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .removeChild(this._container);
}; // deleteSvg()

/**
 * Get the total height of this RichText
 * @return {number} - Total height of this RichText
 */
RichTextView.prototype.getHeight = function getHeight() {
   return this._height;
}; // getHeight()

/**
 * Get the total width of this RichText
 * @return {number} - Total width of this RichText
 */
RichTextView.prototype.getWidth = function getWidth() {
   return this._width;
}; // getWidth()

/**
 * Set the position of this RichText
 * @param {number} x - x-coordinate of left edge of text
 * @param {number} y - y-coordinate of vertical middle of text
 * @return {void}
 */
RichTextView.prototype.setPosition = function setPosition(x, y) {
   //-------------------------------------------------------------------------
   // Note: Coords of html text correspond to TOP left corner
   //-------------------------------------------------------------------------
   this._container.setAttribute("x", x);
   this._container.setAttribute("y", y - this._height/2);
}; // setPosition()

/**
 * Make this RichText visible or invisible
 * @param {boolean} visible - Make the RichText visible (true) or not (false)
 * @return {void}
 */
RichTextView.prototype.setVisible = function setVisible(visible) {
   if (this._isVisible === visible) {
      return;
   }
   this._isVisible = visible;

   if (visible) {
      this._container.setAttribute("visibility", "visible");
   } else {
      this._container.setAttribute("visibility", "hidden");
   }
}; // setVisible()

/**
 * Update this RichText from the corresponding model
 * @return {void}
 */
RichTextView.prototype.update = function update() {
   let domParser;
   let finalWidth;
   let height;
   let richTextAsDoc;
   let richTextRootNode;
   let testWidth;
   let width1;
   let width2;

   //-----------------------------------------------------------------------
   // Delete any existing child nodes (i.e. html text before this update
   // happened).
   //-----------------------------------------------------------------------
   while (this._container.childNodes.length > 0) {
      this._container.removeChild(this._container.childNodes[0]);
   }

   //-----------------------------------------------------------------------
   // Add our rich text to the <foreignObject> container
   //-----------------------------------------------------------------------
   domParser = new DOMParser();
   richTextAsDoc = domParser.parseFromString(this._myNodeModel.getRichText(),
                                             "text/html");
   richTextRootNode = document.importNode(richTextAsDoc.documentElement, true);
   this._container.appendChild(richTextRootNode);

   // <foreignObject> dimensions default to 0x0.
   // Give a super high height so the html is not restricted while we're
   // determining optimal width below
   this._container.setAttribute('height', 10000);

   //-----------------------------------------------------------------------
   // Determine the smallest width required for this richtext by starting at
   // a width that is appropriate for the current display width and doing a
   // binary search to find the point where height changes, with a tolerance of
   // 10 pixels.
   //
   // Note: The size of this html is affected by m3.css. In particular,
   //       if margin-top for <body> is non-zero, we don't get the correct
   //       height, because clientHeight doesn't include margins.
   //-----------------------------------------------------------------------
   width1 = 10;
   width2 = Math.min(MAX_WIDTH, 0.8 * Sizer.svgWidth);
   this._container.setAttribute('width', width2);
   height = richTextRootNode.clientHeight;

   while (width2 - width1 > 10) {
      testWidth = Math.floor((width2 - width1)/2) + width1;
      this._container.setAttribute('width', testWidth);

      if (richTextRootNode.clientHeight === height) {
         // Height still hasn't changed, so narrow down in the lower half
         width2 = testWidth;
      } else {
         // Height changed, so narrow down in the upper half
         width1 = testWidth;
      }
   }

   /*
    * When the loop ends, width1 was always too narrow, and width2 too wide.
    * Since we're within our tolerance, choose width2
    *
    * *But*, there's a special case where the contents didn't cause a height
    * change (like a single image), in which case this algorithm terminated
    * too late.
    * We can detect this since width2 (our calculated width) will be smaller
    * than scrollWidth (the actual required width)
    */
   finalWidth = width2 < richTextRootNode.scrollWidth
      ? richTextRootNode.scrollWidth
      : width2;

   this._container.setAttribute('width', finalWidth);

   /*
    * There doesn't seem to be an easy way to get the richTextRootNode's
    * including margins. And without margins info, our calculated height
    * will be too small. Assuming a margin of 1em seems to work.
    */
   this._container.setAttribute(
      'height',
      richTextRootNode.clientHeight + Sizer.characterHeight
   );

   this._width = finalWidth;
   this._height = richTextRootNode.clientHeight + Sizer.characterHeight;
}; // update()
