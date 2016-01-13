"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License, version 3, as published by
// the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Mobile Mind Mapper.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A CloudView creates and maintains the SVG elements to show a cloud
 * around a node and its children
 *
 * @constructor
 * @param {Cloud} cloud - the Cloud corresponding to this CloudView
 */
export function CloudView(cloud) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._svgCloud = document.createElementNS(SVGNS, "path");
   this._svgCloud.setAttribute("stroke", cloud.getColor());
   this._svgCloud.setAttribute("fill", cloud.getColor());
   this._svgCloud.setAttribute("fill-opacity", "1");

   document.getElementById("svgCloudLayer").appendChild(this._svgCloud);
} // CloudView()

CloudView.PADDING_HORIZONTAL = 5;   // Space between enclosed region and cloud
CloudView.PADDING_VERTICAL = 5;

/**
 * Delete the svg object(s) associated with this cloud
 * @return {void}
 */
CloudView.prototype.deleteSvg = function deleteSvg() {
   document.getElementById("svgCloudLayer").removeChild(this._svgCloud);
}; // deleteSvg()

/**
 * Get the height of this cloud
 * @return {number} - the height of this cloud
 */
CloudView.prototype.getHeight = function getHeight() {
   return this._height;
}; // getHeight()

/**
 * Get the width of this cloud
 * @return {number} - the width of this cloud
 */
CloudView.prototype.getWidth = function getWidth() {
   return this._width;
}; // getWidth()

/**
 * Record the area that must be enclosed by this cloud
 * @param {number} width - Width of region to be enclosed
 * @param {number} height - Height of the region to be enclosed
 * @return {void}
 */
CloudView.prototype.setAreaToEnclose = function setAreaToEnclose(width, height) {
   this._height = height + 2*CloudView.PADDING_VERTICAL;
   this._width = width + 2*CloudView.PADDING_HORIZONTAL;
}; // setAreaToEnclose()

/**
 * Set the position of this cloud.
 * svg rectangles are positioned relative to their top left corner
 * (x, y) are the coordinates of the middle left edge of the cloud.
 *
 * @param {number} x - x-coordinate of left edge of cloud
 * @param {number} y - y-coordinate of vertical middle of cloud
 * @return {void}
 */
CloudView.prototype.setPosition = function setPosition(x, y) {
   let leftX;
   let bottomY;
   let path;

   leftX = x - CloudView.PADDING_HORIZONTAL;
   bottomY = y + this._height/2;

   path = `M ${leftX} ${bottomY} ` +
          `v-${this._height} h ${this._width} v ${this._height} h -${this._width}`;

   this._svgCloud.setAttribute("d", path);
}; // setPosition()

/**
 * Make this cloud visible or invisible
 * @param {boolean} visible - Make the cloud visible (true) or not (false)
 * @return {void}
 */
CloudView.prototype.setVisible = function setVisible(visible) {
   if (visible) {
      this._svgCloud.setAttribute("visibility", "visible");
   } else {
      this._svgCloud.setAttribute("visibility", "hidden");
   }
}; // setVisible()
