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
 * @param {NodeView} myNodeView - the NodeView that the link comes from
 * @param {ArrowLink} arrowLink - the ArrowLink that contains the link info
 */
export function GraphicalLinkView(myNodeView, arrowLink) {
   const SVGNS = "http://www.w3.org/2000/svg";

   this._arrowLink = arrowLink;
   this._myNodeView = myNodeView;
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
   document.getElementById(`${App.HTML_ID_PREFIX}-svgLinksLayer`)
           .removeChild(this._svgGraphicalLink);
}; // deleteSvg()

/**
 * Draw this GraphicalLink
 *
 * @return {void}
 */
GraphicalLinkView.prototype.draw = function draw() {
   let destCoords;
   let destNodeView;
   let destMultiplier;
   let endMarker;
   let oneEndHidden;
   let parentModel;
   let path;
   let srcCoords;
   let srcNodeView;
   let srcMultiplier;

   oneEndHidden = false;

   //--------------------------------------------------------------------------
   // Source Node: Make sure link starts from a visible node
   //--------------------------------------------------------------------------
   srcNodeView = this._myNodeView;
   while (srcNodeView.isVisible() !== true) {
      oneEndHidden = true;
      parentModel = srcNodeView.getModel().getParent();
      srcNodeView = parentModel.getView();
   }

   //--------------------------------------------------------------------------
   // Dest Node: Make sure link ends at a visible node
   //--------------------------------------------------------------------------
   destNodeView = this._arrowLink.getDestinationNode().getView();
   while (destNodeView.isVisible() !== true) {
      oneEndHidden = true;
      parentModel = destNodeView.getModel().getParent();
      destNodeView = parentModel.getView();
   }

   //--------------------------------------------------------------------------
   // Draw it (but not if src and dest nodeViews are the same)
   //--------------------------------------------------------------------------
   if (srcNodeView !== destNodeView) {
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
   } else {
      this.setVisible(false);
   }
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
