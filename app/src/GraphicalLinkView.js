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
import {NodeModel} from './NodeModel';

/**
 * A GraphicalLinkView creates and maintains the SVG elements to show a link
 * between two nodesbetween two nodes
 *
 * @constructor
 * @param {ArrowLink} arrowLink - the ArrowLink that contains the link info
 */
export function GraphicalLinkView(arrowLink) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._arrowLink = arrowLink;
   this._isVisible = true;

   this._svgGraphicalLink = document.createElementNS(SVGNS, "path");
   document.getElementById(`${App.HTML_ID_PREFIX}-svgLinksLayer`)
           .appendChild(this._svgGraphicalLink);

   this._svgGraphicalLink.setAttribute("stroke", this._arrowLink.getColor());
   this._svgGraphicalLink.setAttribute("fill-opacity", "0");
} // GraphicalLinkView()

GraphicalLinkView.ARROW_WIDTH = 20;

/**
 * Delete the svg component(s) corresponding to this GraphicalLink
 *
 * @return {void}
 */
GraphicalLinkView.prototype.deleteSvg = function deleteSvg() {
   /*
    * This can be called twice (once for each end of the link), so don't try to
    * delete something that doesn't exist.
    */
   if (this._svgGraphicalLink) {
      document.getElementById(`${App.HTML_ID_PREFIX}-svgLinksLayer`)
              .removeChild(this._svgGraphicalLink);
      this._svgGraphicalLink = null;
   }
}; // deleteSvg()

/**
 * Draw this GraphicalLink between the specified nodes.
 *
 * @param {NodeView} srcNodeView  The node we're drawing from
 * @param {NodeView} destNodeView The node view we're drawing to
 * @param {boolean}  oneEndHidden Whether one end is hidden (thus we style it
 *                                differently)
 * @return {void}
 */
GraphicalLinkView.prototype.draw = function draw(
   srcNodeView,
   destNodeView,
   oneEndHidden
) {
   let destCoords;
   let destMultiplier;
   let endMarker;
   let path;
   let srcCoords;
   let srcMultiplier;

   srcCoords = srcNodeView.getGraphicalLinkCoords();
   destCoords = destNodeView.getGraphicalLinkCoords();

   // Curvature of each end of the cubic curve depends on which side of root
   // it is on
   if (srcNodeView.getModel().getSide() === NodeModel.POSITION_LEFT) {
      srcMultiplier = -1;
   } else {
      srcMultiplier = 1;
   }

   if (destNodeView.getModel().getSide() === NodeModel.POSITION_LEFT) {
      destMultiplier = -1;
   } else {
      destMultiplier = 1;
   }

   path = `M ${srcCoords.x} ${srcCoords.y} ` +
          `C ${srcCoords.x + srcMultiplier*200} ${srcCoords.y} ` +
          `  ${destCoords.x + destMultiplier*200} ${destCoords.y} ` +
          `  ${destCoords.x} ${destCoords.y}`;
   this._svgGraphicalLink.setAttribute("d", path);

   // Type of connector depends on whether both ends are visible or not
   if (oneEndHidden) {
      endMarker = 'triangle-open';
   } else {
      endMarker = 'triangle-solid';
   }

   this._svgGraphicalLink.setAttribute(
      "marker-end",
      `url(#${App.HTML_ID_PREFIX}-${endMarker})`
   );
   this.setVisible(true);
}; // draw()

/**
 * Make this GraphicalLink visible or invisible
 *
 * @param {boolean} visible - Make the graphical link visible (true) or not
 *                            (false)
 * @return {void}
 */
GraphicalLinkView.prototype.setVisible = function setVisible(visible) {
   if (this._isVisible === visible) {
      return;
   }
   this._isVisible = visible;

   if (visible) {
      this._svgGraphicalLink.setAttribute("display", "visible");
   } else {
      this._svgGraphicalLink.setAttribute("display", "none");
   }
}; // setVisible()
