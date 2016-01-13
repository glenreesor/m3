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

import {m3App} from "./main";
import {Sizer} from "./Sizer";
import {State} from "./State";
/**
 * An ExportDialog object will display the current map in a popup div and wait
 * for OK to be pressed.
 *
 * @constructor
 */
export function ExportDialog() {
   let domParser;
   let html;
   let htmlAsDoc;
   let mapAsXml;

   //--------------------------------------------------------------------------
   // Create the div that contains the exported map
   //--------------------------------------------------------------------------
   mapAsXml = m3App.getController().getMapModel().getAsXml();

   html = `<div id='${ExportDialog.DIALOG_ID}' class='popup' style='height: ${Sizer.popupHeight}px'>` +
          `   <textarea id='${ExportDialog.TEXT_AREA_ID}' rows=20 cols=30>`;
   mapAsXml.forEach(function (xmlLine) {
      // Don't want the export dialog rendering to render the special characters.
      xmlLine = xmlLine.replace(new RegExp("&", "g"), "&amp;");
      html+= xmlLine+"\n";
   });
   html += "   </textarea><br><br>" +
           `<button id='${ExportDialog.OK_ID}'>Ok</button>` +
           "</div>";

   //--------------------------------------------------------------------------
   // Add the html
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._exportDialog = document.importNode(htmlAsDoc.getElementById(ExportDialog.DIALOG_ID), true);
   document.getElementById("app-popups").appendChild(this._exportDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(ExportDialog.OK_ID).addEventListener("click", () => this.close());

   //--------------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById("app-popups").removeAttribute("hidden");
   document.getElementById(ExportDialog.TEXT_AREA_ID).select();
   m3App.getGlobalState().setState(State.STATE_EXPORT_POPUP);
} // ExportDialog()

ExportDialog.DIALOG_ID = "m3-importExportDialog";
ExportDialog.OK_ID = ExportDialog.DIALOG_ID + "Ok";
ExportDialog.TEXT_AREA_ID = ExportDialog.DIALOG_ID + "TextArea";

/**
 * Close this ExportDialog
 *    - Make the global popups div hidden
 *    - Delete the exportPopup div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
ExportDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._exportDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()
