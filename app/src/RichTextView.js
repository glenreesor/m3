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
 * A RichTextView creates and maintains the SVG elements to show HTML text
 * associated with a node text
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this bubble
 * @param {NodeModel} nodeModel - the NodeModel corresponding to this bubble
 */
export function RichTextView(nodeView, nodeModel) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;

   //---------------------------------------------------------------------------
   // One-time creation of required html/svg elements
   //---------------------------------------------------------------------------
   this._svgText = document.createElementNS(SVGNS, "foreignObject");
   document.getElementById("svgTextLayer").appendChild(this._svgText);

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
   this._svgText.removeEventListener("click", this._boundClickListener);
   document.getElementById("svgTextLayer").removeChild(this._svgText);
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
   this._svgText.setAttribute("x", x);
   this._svgText.setAttribute("y", y - this._height/2);
}; // setPosition()

/**
 * Make this RichText visible or invisible
 * @param {boolean} visible - Make the RichText visible (true) or not (false)
 * @return {void}
 */
RichTextView.prototype.setVisible = function setVisible(visible) {
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
RichTextView.prototype.update = function update() {
   let domParser;
   let richTextAsDoc;
   let richTextRootNode;

   //-----------------------------------------------------------------------
   // First figure out dimensions by adding temporily to app-html-sizing div
   //
   // Note: The size of this html is affected by m3.css. In particular,
   //       if margin-top for <body> is non-zero, we don't get the correct
   //       height, because clientHeight doesn't include margins.
   //-----------------------------------------------------------------------
   domParser = new DOMParser();
   richTextAsDoc = domParser.parseFromString(this._myNodeModel.getRichText(),
                                             "text/html");
   richTextRootNode = document.importNode(richTextAsDoc.documentElement, true);

   document.getElementById("app-html-sizing").appendChild(richTextRootNode);
   this._width = richTextRootNode.clientWidth;
   this._height = richTextRootNode.clientHeight;

   this._svgText.setAttribute("width", this._width + "px");
   this._svgText.setAttribute("height", this._height + "px");

   //-----------------------------------------------------------------------
   // Delete any existing child nodes (i.e. html text before this update
   // happened).
   //
   // Note: Adding the rich text node to this._myText unlinks it from
   //       app-html-sizing
   //-----------------------------------------------------------------------
   while (this._svgText.childNodes.length >0) {
      this._svgText.removeChild(this._svgText.childNodes[0]);
   }

   this._svgText.appendChild(richTextRootNode);
}; // update()
