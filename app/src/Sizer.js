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
 * Sizer is an object to handle initializing the size of the app, and setting
 * up event handlers to deal with resize events. Only expect one of these
 * objects to be instantiated.
 *
 * @constructor
 */
export function Sizer() {
   let app;
   let appDrawingArea;
   let svgElement;

   app = document.getElementById(`${App.HTML_ID_PREFIX}-app`);
   appDrawingArea = document.getElementById(
      `${App.HTML_ID_PREFIX}-drawing-area`
   );
   svgElement = document.getElementById(`${App.HTML_ID_PREFIX}-svg-element`);

   //-------------------------------------------------------------------------
   // Set styles that only have to be set once
   //-------------------------------------------------------------------------
   app.style.marginTop    = Sizer._MARGINS.appMarginTop + "px";
   app.style.marginBottom = Sizer._MARGINS.appMarginBottom + "px";
   app.style.marginLeft   = Sizer._MARGINS.appMarginLeft + "px";
   app.style.marginRight  = Sizer._MARGINS.appMarginRight + "px";


   svgElement.setAttribute("style", `border: ${Sizer._SVG_BORDER_WIDTH}px ` +
                           "solid black;");

   //-------------------------------------------------------------------------
   // Only reserve space for icons if they're showing
   //-------------------------------------------------------------------------
   Sizer._SIDE_ICONS_WIDTH = (m3App.showButtons() && !m3App.isReadOnly())
      ? 40      // Includes blank space and active border
      : 0;

   Sizer._BOTTOM_ICONS_HEIGHT = m3App.showButtons()
      ? 48     // Includes blank space, active border width, and fudge factor
      : 8;     // Fudge factor -- not worried about figuring it out for now

   //-------------------------------------------------------------------------
   // Resize whenever window changes dimensions
   //-------------------------------------------------------------------------
   window.addEventListener("resize",  Sizer.setSize);

   Sizer.setSize();
} // Sizer()

Sizer._MARGINS = {appMarginTop: 1,          appMarginBottom: 1,
                  appMarginLeft: 1,         appMarginRight: 1};
Sizer._SVG_BORDER_WIDTH = 1;

/**
 * The method to be called whenever the app is resized.
 * @return {void}
 */
Sizer.setSize = function() {
   let appPopups;
   let appTopHeight;
   let container;
   let requiredHeight;
   let svgElement;
   let svgHeight;
   let svgWidth;
   let tempText;
   let totalAppHeight;
   let totalAppWidth;

   //--------------------------------------------------------------------------
   // Determine outer dimensions of m3
   //
   // We use a JS-specified height rather than style on the container because
   // '100%' on a <div> has no effect
   //--------------------------------------------------------------------------
   container = document.getElementById(`${App.HTML_ID_PREFIX}-container`);

   if (m3App.isFullPage()) {
      container.style.height = window.innerHeight + 'px';

      // We don't want scrollbars
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';

   } else {
      requiredHeight = m3App.getHeight();

      if (requiredHeight[requiredHeight.length-1] === '%') {
         // Manually calculate height in pixels when a % is specified
         container.style.height = (window.innerHeight *
                                  requiredHeight.slice(0, -1) / 100) + 'px';
      } else {
         container.style.height = requiredHeight;
      }

      container.style.width = m3App.getWidth();
   }

   totalAppHeight = container.clientHeight -
                    Sizer._MARGINS.appMarginTop -
                    Sizer._MARGINS.appMarginBottom;

   totalAppWidth = container.clientWidth;

   //--------------------------------------------------------------------------
   // Set the root svg size, because it doesn't expand to fill its parent
   // element
   //--------------------------------------------------------------------------

   // Need to check if we're rendering mapname, since the initial sizing
   // happens before the mapname is disabled
   appTopHeight = m3App.showMapName()
      ? document.getElementById(`${App.HTML_ID_PREFIX}-top`).clientHeight
      : 0;

   svgElement = document.getElementById(`${App.HTML_ID_PREFIX}-svg-element`);
   svgHeight = totalAppHeight - appTopHeight - 2*Sizer._SVG_BORDER_WIDTH -
               Sizer._BOTTOM_ICONS_HEIGHT;

   svgWidth = totalAppWidth - 2*Sizer._SVG_BORDER_WIDTH -
              Sizer._SIDE_ICONS_WIDTH;

   svgElement.setAttribute("height", svgHeight + "px");
   svgElement.setAttribute("width", svgWidth + "px");

   Sizer.svgHeight = svgHeight;
   Sizer.svgWidth = svgWidth;

   //--------------------------------------------------------------------------
   // Make room for buttons on the right and align the bottom button with
   // the bottom row of buttons
   //--------------------------------------------------------------------------
   document.getElementById(
      `${App.HTML_ID_PREFIX}-left`
   ).style.width = totalAppWidth - Sizer._SIDE_ICONS_WIDTH + 'px';

   /*
    * Data we're working with:
    *    - Icon height: 32px
    *    - Icon border: 2px *2 (top and bottom)
    *    - Bottom margins of icons: 10px
    *    - We want the bottom icon to be below the drawing area
    *    - Fudge factor to line up with bottom icons
    *
    * Thus offset is 4 * (32 + 4 + 10) + 6 = 190
    */

   document.getElementById(
      `${App.HTML_ID_PREFIX}-right`
   ).style.marginTop = appTopHeight + Sizer.svgHeight - 190 + 'px';

   //--------------------------------------------------------------------------
   // Store dimensions for other parts of app to reference
   //--------------------------------------------------------------------------
   Sizer.popupHeight = totalAppHeight/3;

   //--------------------------------------------------------------------------
   // Set the position of the popups
   //--------------------------------------------------------------------------
   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("style", "width: " + (svgWidth*3/4) + "px;" +
                          "margin-left: " + (svgWidth*1/4/2) + "px;");

   //--------------------------------------------------------------------------
   // Determine approximate width and height of one character. Useful for other
   // code
   //--------------------------------------------------------------------------
   tempText = document.createElement('span');
   tempText.appendChild(document.createTextNode('X'));
   document.getElementById(`${App.HTML_ID_PREFIX}-html-sizing`)
           .appendChild(tempText);
   Sizer.characterWidth = tempText.offsetWidth;
   Sizer.characterHeight = tempText.offsetHeight;
   document.getElementById(`${App.HTML_ID_PREFIX}-html-sizing`)
           .removeChild(tempText);
}; // setSize()
