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

import {App} from "./App";

/** The App */
export let m3App;

/**
 * Mainline
 * @return {void}
 */
export function main() {
   let modifiedIcon;

   buildAppStructure();
   m3App = new App();
   m3App.run();

   // Hack to set the proper src for the "modified" icon
   modifiedIcon = document.getElementById(`${App.HTML_ID_PREFIX}-modified`);
   modifiedIcon.setAttribute('src', `${m3App.getM3Path()}/images/modified.svg`);
} // main()

/**
 * Build the static markup for the app.
 *
 * @return {void}
 */
function buildAppStructure() {
   let appMarkup;
   let htmlAsDoc;
   let domParser;

   const MARKUP =
      `<div id='${App.HTML_ID_PREFIX}-app'>` +
      `   <div id='${App.HTML_ID_PREFIX}-left' style='float: left;'> ` +
      `      <div id='${App.HTML_ID_PREFIX}-top'> ` +
      `         <span id='${App.HTML_ID_PREFIX}-mapName'></span>` +
      "         <img " +
      `            id='${App.HTML_ID_PREFIX}-modified' ` +
      "            style='margin-bottom: 3px;' " +
      "            height='5px' " +
      "            src='images/modified.svg'" +
      "         />" +
      "      </div>" +

      `      <div id='${App.HTML_ID_PREFIX}-popups' hidden>` +
      "      </div>" +

      "      <div " +
      `         id='${App.HTML_ID_PREFIX}-html-sizing' ` +
      "         style='word-wrap:break-word;'" +
      "      >" +
      "      </div>" +

      `      <div id='${App.HTML_ID_PREFIX}-drawing-area'>` +
      "         <svg " +
      "            xmlns='http://www.w3.org/2000/svg' " +
      `            id='${App.HTML_ID_PREFIX}-svg-element'` +
      "         >" +
      "            <defs>" +
      `               <marker id='${App.HTML_ID_PREFIX}-triangle'` +
      "                       viewBox='0 0 10 10'" +
      "                       refX='1' refY='5'" +
      "                       markerWidth='12'" +
      "                       markerHeight='12'" +
      "                       orient='auto'>" +
      "                   <path d='M 0 0 L 10 5 L 0 10 z' />" +
      "              </marker>" +
      "            </defs>" +

      `            <g id='${App.HTML_ID_PREFIX}-svg-g-element'>` +
      `               <g id='${App.HTML_ID_PREFIX}-svgCloudLayer'> </g>` +
      `               <g id='${App.HTML_ID_PREFIX}-svgLinksLayer'> </g>` +
      `               <g id='${App.HTML_ID_PREFIX}-svgBubbleLayer'> </g>` +
      `               <g id='${App.HTML_ID_PREFIX}-svgTextLayer'> </g>` +
      "            </g>" +
      "         </svg>" +
      "      </div>" +
      "   </div>" +
      `   <div id='${App.HTML_ID_PREFIX}-right' style='float: right;'> ` +
      "   </div>" +
      "</div>";

   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(MARKUP, "text/html");
   appMarkup = document.importNode(
      htmlAsDoc.getElementById(`${App.HTML_ID_PREFIX}-app`),
      true
   );

   document.getElementById(`${App.HTML_ID_PREFIX}-container`)
           .appendChild(appMarkup);
}
