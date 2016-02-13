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

/**
 * A ConnectorView creates and maintains the SVG elements to show a connector
 * from the specified node to its parent
 *
 * @constructor
 * @param {NodeView} nodeView - the NodeView corresponding to this node (the child
 *                              that will connect to its parent)
 */
export function ConnectorView(nodeView) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._svgConnector = document.createElementNS(SVGNS, "path");
   this._svgConnector.setAttribute("stroke", "#000000");
   this._svgConnector.setAttribute("fill-opacity", "0");

   document.getElementById("svgBubbleLayer").appendChild(this._svgConnector);
} // ConnectorView()

ConnectorView.WIDTH = 30;     // The width of all connectors

/**
 * Delete the svg object(s) associated with this connector
 * @return {void}
 */
ConnectorView.prototype.deleteSvg = function deleteSvg() {
   document.getElementById("svgBubbleLayer").removeChild(this._svgConnector);
}; // deleteSvg()

/**
 * Get the width of this connector
 * @return {number} - the width of this connector
 */
ConnectorView.prototype.getWidth = function getWidth() {
   return ConnectorView.WIDTH;
}; // getWidth()

/**
 * Set the positions of the endpoints of this connector. It doesn't matter
 * which endpoint is specified first
 *
 * @param {number} x1 - x-coordinate of first end of the connector
 * @param {number} y1 - y-coordinate of first end of the connector
 * @param {number} x2 - x-coordinate of second end of the connector
 * @param {number} y2 - y-coordinate of second end of the connector
 * @return {void}
 */
ConnectorView.prototype.setPosition = function setPosition(x1, y1, x2, y2) {
   let firstMultiplier;      // For creating proper curvature
   let path;
   let secondMultiplier;      // For creating proper curvature

   // Special case is a straight line:
   if (y1 === y2) {
      path = `M ${x1} ${y1} L ${x2} ${y2}`;
   } else {
      if (x1 < x2) {
         firstMultiplier = 1;
         secondMultiplier = -1;
      } else {
         firstMultiplier = -1;
         secondMultiplier = 1;
      }
      path = `M ${x1} ${y1} C ${x1 + firstMultiplier*20} ${y1} ` +
             `  ${x2 + secondMultiplier*20} ${y2} ${x2} ${y2}`;
   }

   this._svgConnector.setAttribute("d", path);
}; // setPosition()

/**
 * Make this connector visible or invisible
 * @param {boolean} visible - Make the connector visible (true) or not (false)
 * @return {void}
 */
ConnectorView.prototype.setVisible = function setVisible(visible) {
   if (visible) {
      this._svgConnector.setAttribute("visibility", "visible");
   } else {
      this._svgConnector.setAttribute("visibility", "hidden");
   }
}; // setVisible()
