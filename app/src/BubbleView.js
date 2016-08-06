"use strict";

// Copyright 2015, 2016 Glen Reesor
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

import {m3App} from "./main";

/**
 * A BubbleView creates and maintains the SVG elements to show a bubble
 * around the node text
 *
 * @constructor
 * @param {NodeView}  nodeView     - the NodeView corresponding to this bubble
 * @param {NodeModel} nodeModel    - the NodeModel corresponding to this bubble
 * @param {TextView}  textView     - the TextView that this bubble must enclose
 * @param {LinkIcon}  linkIconView - the LinkIconView that this bubble must
 *                                   enclose
 */
export function BubbleView(nodeView, nodeModel, textView, linkIconView) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._myLinkIconView = linkIconView;
   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;
   this._myTextView = textView;
   this._isSelected = false;

   this._height = 0;
   this._width = 0;

   //---------------------------------------------------------------------------
   // One-time creation of required svg element
   //---------------------------------------------------------------------------
   this._svgBubble = document.createElementNS(SVGNS, "rect");
   document.getElementById("svgBubbleLayer").appendChild(this._svgBubble);
   this._svgBubble.setAttribute("rx", 5);
   this._svgBubble.setAttribute("ry", 5);

   //---------------------------------------------------------------------------
   // .bind() effectively produces a new function *each* time, thus can't use
   // .bind() once for creating the listener and once for removing it.
   // So keep it here for future reference when removing the listener
   //---------------------------------------------------------------------------
   this._boundClickListener = this._clickListener.bind(this);
   this._svgBubble.addEventListener("click", this._boundClickListener);

   //---------------------------------------------------------------------------
   // Now update with information from corresponding nodeModel
   //---------------------------------------------------------------------------
   this.update();

} // BubbleView()

// Padding between bubble and inner text
BubbleView.TEXT_BUBBLE_INNER_PADDING = 5;

/**
 * Listener function for this bubble
 * Note that 'this' must be bound to this BubbleView object.
 *
 * @return {void}
 */
BubbleView.prototype._clickListener = function _clickListener() {
   m3App.getController().getMapViewController().nodeClicked(this._myNodeView);
}; // _clickListener()

/**
 * Delete the svg object(s) corresponding to this bubble
 *
 * @return {void}
 */
BubbleView.prototype.deleteSvg = function deleteSvg() {
   this._svgBubble.removeEventListener("click", this._boundClickListener);
   document.getElementById("svgBubbleLayer").removeChild(this._svgBubble);
}; // deleteSvg()

/**
 * Get the height of this bubble
 * @return {number} - the height of this bubble
 */
BubbleView.prototype.getHeight = function getHeight() {
   return this._height;
}; // getHeight()

/**
 * Get the width of this bubble
 * @return {number} - the width of this bubble
 */
BubbleView.prototype.getWidth = function getWidth() {
   return this._width;
}; // getWidth()

/**
 * Set the position of this bubble.
 * svg rectangles are positioned relative to their top left corner
 * (x, y) are the coordinates of the middle left edge of the bubble.
 *
 * @param {number} x - x-coordinate of left edge of bubble
 * @param {number} y - y-coordinate of vertical middle of bubble
 * @return {void}
 */
BubbleView.prototype.setPosition = function setPosition(x, y) {
   this._svgBubble.setAttribute("x", x);
   this._svgBubble.setAttribute("y", y - this.getHeight()/2);
}; // setPosition()

/**
 * Signify that this nodeView has been selected.
 *
 * @param {boolean} state - true = this nodeView has been selected
 *                         false = this nodeView has been deselected
 * @return {void}
 */
BubbleView.prototype.setSelected = function setSelected(state) {
   this._isSelected = state;

   if (state === true) {
      this._svgBubble.setAttribute("stroke", "#0000ff");
      this._svgBubble.setAttribute("stroke-width", 3);
   } else {
      this._svgBubble.setAttribute("stroke", "#000000");
      this._svgBubble.setAttribute("stroke-width", 1);
   }
}; // setSelected()

/**
 * Make this bubble visible or invisible
 * @param {boolean} visible - Make the bubble visible (true) or not (false)
 * @return {void}
 */
BubbleView.prototype.setVisible = function setVisible(visible) {
   if (visible) {
      this._svgBubble.setAttribute("visibility", "visible");
   } else {
      this._svgBubble.setAttribute("visibility", "hidden");
   }
}; // setVisible()

/**
 * Update this bubble from the corresponding model(s)
 * @return {void}
 */
BubbleView.prototype.update = function update() {
   let backgroundColor;
   let linkIconHeight;
   let linkIconWidth;

   linkIconHeight = 0;
   linkIconWidth = 0;

   if (this._myLinkIconView !== null) {
      linkIconHeight = this._myLinkIconView.getHeight();
      linkIconWidth = this._myLinkIconView.getWidth();
   }

   this.setSelected(this._isSelected);

   //--------------------------------------------------------------------------
   // Determine height of everything that must be enclosed, plus the padding
   // between contents and the bubble
   //--------------------------------------------------------------------------
   this._height = Math.max(linkIconHeight, this._myTextView.getHeight()) +
                  2*BubbleView.TEXT_BUBBLE_INNER_PADDING;

   //--------------------------------------------------------------------------
   // Determine width of everything that must be enclosed, plus the padding
   // between contents and the bubble
   //
   // Required widths:
   // Padding, text, (padding, linkIcon), padding
   //--------------------------------------------------------------------------
   this._width = this._myTextView.getWidth() +
                 2*BubbleView.TEXT_BUBBLE_INNER_PADDING;

   if (linkIconWidth !== 0) {
      this._width += BubbleView.TEXT_BUBBLE_INNER_PADDING + linkIconWidth;
   }

   //--------------------------------------------------------------------------
   // Update SVG objects
   //--------------------------------------------------------------------------
   backgroundColor = this._myNodeModel.getBackgroundColor();
   if (backgroundColor === '') {
      backgroundColor = 'none';
   }

   this._svgBubble.setAttribute("fill", backgroundColor);
   this._svgBubble.setAttribute("height", this._height);
   this._svgBubble.setAttribute("width", this._width);
}; // update()
