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

/**
 * A FoldingIconView creates and maintains the SVG elements to show a folding
 * icon from the specified node
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this node
 * @param {NodeModel} nodeModel - the NodeModel corresponding to this node
 */
export function FoldingIconView(nodeView, nodeModel) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._myNodeModel = nodeModel;
   this._myNodeView = nodeView;
   this._isVisible = true;

   this._svgFoldingIcon = document.createElementNS(SVGNS, "circle");
   document.getElementById(`${App.HTML_ID_PREFIX}-svgBubbleLayer`)
           .appendChild(this._svgFoldingIcon);

   this._svgFoldingIcon.setAttribute("r", FoldingIconView.FOLDING_ICON_RADIUS);
   this._svgFoldingIcon.setAttribute("stroke", "#000000");

   //---------------------------------------------------------------------------
   // .bind() effectively produces a new function *each* time, thus can't use
   // .bind() once for creating the listener and once for removing it.
   // So keep it here for future reference when removing the listener
   //---------------------------------------------------------------------------
   this._boundClickListener = this._clickListener.bind(this);
   this._svgFoldingIcon.addEventListener("click", this._boundClickListener);

   //---------------------------------------------------------------------------
   // Now update with information from corresponding nodeModel
   //---------------------------------------------------------------------------
   this.update();
} // FoldingIconView()

FoldingIconView.FOLDING_ICON_RADIUS = 10;

/**
 * Listener function for this folding icon
 * Note that 'this' must be bound to this FoldingIconView oject
 *
 * @return {void}
 */
FoldingIconView.prototype._clickListener = function _clickListener() {
   m3App.getController().toggleFoldedStatus(this._myNodeView.getModel());
}; // _clickListener()

/**
 * Delete the svg component(s) corresponding to this FoldingIcon
 *
 * @return {void}
 */
FoldingIconView.prototype.deleteSvg = function deleteSvg() {
   this._svgFoldingIcon.removeEventListener("click", this._boundClickListener);
   document.getElementById(`${App.HTML_ID_PREFIX}-svgBubbleLayer`)
           .removeChild(this._svgFoldingIcon);
}; // deleteSvg()

/**
 * Get the height of this FoldingIcon
 * @return {number} - the height of this folding icon
 */
FoldingIconView.prototype.getHeight = function getHeight() {
   return FoldingIconView.FOLDING_ICON_RADIUS*2;
}; // getHeight()

/**
 * Get the width of this FoldingIcon
 * @return {number} - the width of this folding icon
 */
FoldingIconView.prototype.getWidth = function getWidth() {
   return FoldingIconView.FOLDING_ICON_RADIUS*2;
}; // getWidth()

/**
 * Set the position of this FoldingIcon.
 * @param {number} x - The left edge of this folding icon
 * @param {number} y - The vertical middle of this folding icon
 * @return {void}
 */
FoldingIconView.prototype.setPosition = function setPosition(x, y) {
   this._svgFoldingIcon.setAttribute("cx",
                                     x + FoldingIconView.FOLDING_ICON_RADIUS);
   this._svgFoldingIcon.setAttribute("cy", y);
}; // setPosition()

/**
 * Make this FoldingIcon visible or invisible
 * @param {boolean} visible - Make the folding icon visible (true) or not
 *                           (false)
 * @return {void}
 */
FoldingIconView.prototype.setVisible = function setVisible(visible) {
   if (this._isVisible === visible) {
      return;
   }
   this._isVisible = visible;

   if (visible) {
      this._svgFoldingIcon.setAttribute("display", "visible");
   } else {
      this._svgFoldingIcon.setAttribute("display", "none");
   }
}; // setVisible()

/**
 * Update this FoldingIcon from the corresponding model
 *
 * @return {void}
 */
FoldingIconView.prototype.update = function update() {
   if (this._myNodeModel.isFolded()) {
      this._svgFoldingIcon.setAttribute("fill-opacity", "1");
   } else {
      this._svgFoldingIcon.setAttribute("fill-opacity", "0");
   }
}; // update()
