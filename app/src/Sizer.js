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
 * Sizer is an object to handle initializing the size of the app, and setting
 * up event handlers to deal with resize events. Only expect one of these objects
 * to be instantiated.
 *
 * @constructor
 */
export function Sizer() {
   let app;
   let appDrawingArea;
   let svgElement;

   app = document.getElementById("app");
   appDrawingArea = document.getElementById("app-drawing-area");
   svgElement = document.getElementById("svg-element");

   //-------------------------------------------------------------------------
   // Set styles that only have to be set once
   //-------------------------------------------------------------------------
   app.style.marginTop    = Sizer._MARGINS.appMarginTop + "px";
   app.style.marginBottom = Sizer._MARGINS.appMarginBottom + "px";
   app.style.marginLeft   = Sizer._MARGINS.appMarginLeft + "px";
   app.style.marginRight  = Sizer._MARGINS.appMarginRight + "px";

   appDrawingArea.style.marginRight = Sizer._SIDE_ICONS_WIDTH + "px";
   appDrawingArea.style.marginBottom = Sizer._BOTTOM_ICONS_HEIGHT + "px";

   svgElement.setAttribute("style", "border: " + Sizer._SVG_BORDER_WIDTH + "px solid black;");

   //-------------------------------------------------------------------------
   // Resize whenever window changes dimensions
   //-------------------------------------------------------------------------
   window.addEventListener("resize",  Sizer.setSize);

   Sizer.setSize();
} // Sizer()

Sizer._MARGINS = {appMarginTop: 1,          appMarginBottom: 1,
                  appMarginLeft: 1,         appMarginRight: 1};
Sizer._BOTTOM_ICONS_HEIGHT = 44; // Includes blank space as well as active border width
Sizer._SIDE_ICONS_WIDTH = 38; // Includes blank space as well as active border width
Sizer._SVG_BORDER_WIDTH = 1;

/**
 * The method to be called whenever the app is resized.
 * @return {void}
 */
Sizer.setSize = function () {
   let svgElement;
   let svgHeight;
   let svgWidth;
   let appPopups;
   let appTopHeight;
   let totalAppHeight;
   let totalAppWidth;

   //--------------------------------------------------------------------------
   // Figure out dimensions that are required for determining svg dimensions
   //--------------------------------------------------------------------------
   totalAppHeight = window.innerHeight -
                    Sizer._MARGINS.appMarginTop -
                    Sizer._MARGINS.appMarginBottom;
   totalAppWidth = document.getElementById("app").clientWidth;

   //--------------------------------------------------------------------------
   // Store dimensions for other parts of app to reference
   //--------------------------------------------------------------------------
   Sizer.popupHeight = totalAppHeight/3;

   //--------------------------------------------------------------------------
   // Set the root svg size, because it doesn't expand to fill its parent
   // element
   //--------------------------------------------------------------------------
   appTopHeight = document.getElementById("app-top").clientHeight;

   svgElement = document.getElementById("svg-element");
   svgHeight = totalAppHeight - appTopHeight - 2*Sizer._SVG_BORDER_WIDTH - Sizer._BOTTOM_ICONS_HEIGHT;
   svgWidth = totalAppWidth - 2*Sizer._SVG_BORDER_WIDTH - Sizer._SIDE_ICONS_WIDTH;

   svgElement.setAttribute("height", svgHeight + "px");
   svgElement.setAttribute("width", svgWidth + "px");

   //--------------------------------------------------------------------------
   // Set the position of the popups
   //--------------------------------------------------------------------------
   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("style", "width: " + (svgWidth*3/4) + "px;" +
                          "margin-left: " + (svgWidth*1/4/2) + "px;");
}; // setSize()
