"use strict";

// Copyright 2016-2017 Glen Reesor
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

const HEIGHT = 20;
const WIDTH = 20;

/**
 * An IconView creates elements to show an icon inside a Node.
 *
 * @constructor
 * @param {NodeView}  nodeView  - the NodeView corresponding to this IconView
 * @param {IconModel} iconModel - the NodeModel corresponding to this IconView
 */
export function IconView(nodeView, iconModel) {
   const SVGNS = 'http://www.w3.org/2000/svg';

   this._iconModel = iconModel;
   this._myNodeView = nodeView;
   this._imagesPath = `${App.getM3Path()}/images`;

   //---------------------------------------------------------------------------
   // One-time creation of required svg element
   //---------------------------------------------------------------------------
   this._svgImage = document.createElementNS(SVGNS, 'image');
   this._svgImage.setAttribute('width', WIDTH);
   this._svgImage.setAttribute('height', HEIGHT);

   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .appendChild(this._svgImage);

   //---------------------------------------------------------------------------
   // .bind() effectively produces a new function *each* time, thus can't use
   // .bind() once for creating the listener and once for removing it.
   // So keep it here for future reference when removing the listener
   //---------------------------------------------------------------------------
   this._boundClickListener = this._clickListener.bind(this);
   this._svgImage.addEventListener('click', this._boundClickListener);

   //---------------------------------------------------------------------------
   // Now update with information from corresponding nodeModel
   //---------------------------------------------------------------------------
   this.update();

} // IconView()

/**
 * Listener function for this IconView
 * Note that 'this' must be bound to this IconView oject
 *
 * @return {void}
 */
IconView.prototype._clickListener = function _clickListener() {
   m3App.getController().getMapViewController().nodeClicked(this._myNodeView);
}; // _clickListener()

/**
 * Delete the svg object(s) corresponding to this IconView
 *
 * @return {void}
 */
IconView.prototype.deleteSvg = function deleteSvg() {
   this._svgImage.removeEventListener('click', this._boundClickListener);
   document.getElementById(`${App.HTML_ID_PREFIX}-svgTextLayer`)
           .removeChild(this._svgImage);
}; // deleteSvg()

/**
 * Get the total height of this IconView
 * @return {number} - Total height of this RichText
 */
IconView.prototype.getHeight = function getHeight() {
   return HEIGHT;
}; // getHeight()

/**
 * Get the total width of this IconView
 * @return {number} - Total width of this IconView
 */
IconView.prototype.getWidth = function getWidth() {
   return WIDTH;
}; // getWidth()

/**
 * Set the position of this IconView
 * @param {number} x - x-coordinate of left edge of icon
 * @param {number} y - y-coordinate of vertical middle of icon
 * @return {void}
 */
IconView.prototype.setPosition = function setPosition(x, y) {
   this._svgImage.setAttribute('x', x);
   this._svgImage.setAttribute('y', y - 0.5 * HEIGHT);
}; // setPosition()

/**
 * Make this IconView visible or invisible
 * @param {boolean} visible - Make the IconView visible (true) or not (false)
 * @return {void}
 */
IconView.prototype.setVisible = function setVisible(visible) {
   if (visible) {
      this._svgImage.setAttribute("visibility", "visible");
   } else {
      this._svgImage.setAttribute("visibility", "hidden");
   }
}; // setVisible()

/**
 * Update this IconView from the corresponding model
 * @return {void}
 */
IconView.prototype.update = function update() {
   const XLINKNS = 'http://www.w3.org/1999/xlink';
   let iconName;

   this.setVisible(true);

   iconName = this._iconModel.getName().replace('%', 'percent');

   this._svgImage.setAttributeNS(
      XLINKNS,
      'href',
      `${this._imagesPath}/icons/${iconName}.svg`
   );
}; // update()
