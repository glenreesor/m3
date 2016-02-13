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
 * A TextView creates and maintains the SVG elements to show unformatted text
 * associated with a node text
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this bubble
 * @param {NodeModel} nodeModel - the NodeModel corresponding to this bubble
 */
export function TextView(nodeView, nodeModel) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;

   //---------------------------------------------------------------------------
   // One-time creation of required html/svg elements
   //---------------------------------------------------------------------------
   this._svgText = document.createElementNS(SVGNS, "text");
   this._svgText.appendChild(document.createTextNode("")); // Will be replaced by update()
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
   document.getElementById("svgTextLayer").removeChild(this._svgText);
}; // deleteSvg()

/**
 * Get the total height of this Text
 * @return {number} - Total height of this Text
 */
TextView.prototype.getHeight = function getHeight() {
   return this._svgText.getBBox().height;
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
   //-------------------------------------------------------------------------
   // Note: Coords of svg text correspond to bottom left corner
   //-------------------------------------------------------------------------
   this._svgText.setAttribute("x", x);
   this._svgText.setAttribute("y", y + this.getHeight()/2);
}; // setPosition()

/**
 * Make this Text visible or invisible
 * @param {boolean} visible - Make the Text visible (true) or not (false)
 * @return {void}
 */
TextView.prototype.setVisible = function setVisible(visible) {
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
   this._svgText.childNodes[0].data = this._myNodeModel.getText();

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

      this._svgText.setAttribute("font-size", this._myNodeModel.getFont().getSize());
   }
   this._svgText.setAttribute("fill", this._myNodeModel.getTextColor());
}; // update()
