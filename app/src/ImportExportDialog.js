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

import {ExportDialog} from "./ExportDialog";
import {m3App} from "./main";
import {App} from './App';
import {MapModel} from "./MapModel";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A ImportExportDialog object will handle displaying a dialog to import or
 * export maps, and then trigger the actual action.
 *
 * @constructor
 */
export function ImportExportDialog() {
   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${ImportExportDialog.DIALOG_ID}' class='popup' ` +
             `style='height: ${Sizer.popupHeight}px'>` +
             "<p>" +
                "Import from .mm file:" +
                `<input id='${ImportExportDialog.FILE_INPUT_ID}' type='file'` +
                "</p>" +
                "<br>" +
                "<p>" +
                   "Export to .mm file:" +
                   `<button id='${ImportExportDialog.EXPORT_ID}'>` +
                   `Export</button>` +
                "</p>" +
                "<br>" +
             `<button id='${ImportExportDialog.CANCEL_ID}'>Cancel</button>` +
          "</div>";

   //--------------------------------------------------------------------------
   // Add the html
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._importExportDialog = document.importNode(
      htmlAsDoc.getElementById(ImportExportDialog.DIALOG_ID), true);

   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._importExportDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(ImportExportDialog.CANCEL_ID)
      .addEventListener("click", () => this.close());

   document.getElementById(ImportExportDialog.EXPORT_ID)
      .addEventListener("click", () => this.exportMap());

   document.getElementById(ImportExportDialog.FILE_INPUT_ID)
   .addEventListener("change", (event) => this.fileInput(event));

   //--------------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_IMPORT_EXPORT);
} // ImportExportDialog()

ImportExportDialog.DIALOG_ID = `${App.HTML_ID_PREFIX}-importExportDialog`;
ImportExportDialog.CANCEL_ID = ImportExportDialog.DIALOG_ID + "Cancel";
ImportExportDialog.EXPORT_ID = ImportExportDialog.DIALOG_ID + "Export";
ImportExportDialog.FILE_INPUT_ID = ImportExportDialog.DIALOG_ID + "FileInput";

/**
 * Close this ImportExport Dialog:
 *    - Make the global popups div hidden
 *    - Delete the importExportDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
ImportExportDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._importExportDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * Export the current map as XML
 *
 * @return {void}
 */
ImportExportDialog.prototype.exportMap = function exportMap() {
   this.close();
   let exportDialog = new ExportDialog();
}; // exportMap()

/**
 * Import the specified file
 *
 * @param {Event} event - The event corresponding to the file being parsed
 * @return {void}
 */
ImportExportDialog.prototype.fileInput = function fileInput(event) {
   let fileReader;
   let newMap;

   fileReader = new FileReader();
   fileReader.onloadend = () => {
      m3App.getController().newMap(MapModel.TYPE_XML, null, "Imported Map",
                                   [fileReader.result]);
      this.close();
   };
   fileReader.readAsText(event.target.files[0]);

}; // fileInput()
