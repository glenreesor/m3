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

import {App} from "./App";
import {ErrorDialog} from "./ErrorDialog";
import {m3App} from "./main";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A RenameMapDialog object will handle displaying a dialog to rename
 * the specified map.
 *
 * @constructor
 * @param {[{String, String}]} mapList - The entire list of saved maps
 * @param {Number} indexToRename - The index of the map entry in mapList to be
 *                                 renamed
 */
export function RenameMapDialog(mapList, indexToRename) {
   let domParser;
   let html;
   let htmlAsDoc;
   let sanitizedMapName;

   // Remove the following from mapName: & < > " '
   sanitizedMapName = mapList[indexToRename].name.replace(new RegExp("&", "g"),
                                                          "&amp;");
   sanitizedMapName = sanitizedMapName.replace(new RegExp("<", "g"), "&lt;");
   sanitizedMapName = sanitizedMapName.replace(new RegExp(">", "g"), "&gt;");
   sanitizedMapName = sanitizedMapName.replace(new RegExp('"', "g"), "&quot;");
   sanitizedMapName = sanitizedMapName.replace(new RegExp("'", "g"), "&apos;");

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${RenameMapDialog.DIALOG_ID}' class='popup' ` +
             `style='height: ${Sizer.popupHeight}px'>` +
             "<p style='text-align: center; font-weight: bold'>Saved Maps</p>";

   // Add the list of saved maps, except the map to rename
   mapList.forEach(function(map, index) {
      if (index !== indexToRename) {
         html += `<p>${map.name}</p>`;
      }
   });

   // Show the old name and allow them to rename
   html += `<p>Old name: ${sanitizedMapName}</p>`;
   html += "<p>New name: <input type='text' id='" +
              `${RenameMapDialog.INPUT_FIELD_ID}'` +
               `size='30' value='${sanitizedMapName}'/>`;

   // Add the buttons
   html += `   <br><br><button id='${RenameMapDialog.OK_ID}'>Ok</button>` +
           `   <button id='${RenameMapDialog.CANCEL_ID}'>Cancel</button>` +
           "</div>";

   //--------------------------------------------------------------------------
   // Create the dialog
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._renameMapDialog = document.importNode(htmlAsDoc
      .getElementById(RenameMapDialog.DIALOG_ID), true);
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._renameMapDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(RenameMapDialog.OK_ID).addEventListener("click",
      () => this.renameMap(mapList, indexToRename));

   document.getElementById(RenameMapDialog.CANCEL_ID).addEventListener("click",
      () => this.close());

   document.getElementById(RenameMapDialog.INPUT_FIELD_ID)
      .addEventListener("keypress",
      (e) => this.keyPress(e, mapList, indexToRename));

   //--------------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_RENAME_MAP);

   //--------------------------------------------------------------------------
   // Select all text and give it focus
   //--------------------------------------------------------------------------
   (document.getElementById(RenameMapDialog.INPUT_FIELD_ID)).select();
   (document.getElementById(RenameMapDialog.INPUT_FIELD_ID)).focus();
} // RenameMapDialog()

RenameMapDialog.DIALOG_ID = "m3-renameMapDialog";
RenameMapDialog.CANCEL_ID = RenameMapDialog.DIALOG_ID + "Cancel";
RenameMapDialog.OK_ID = RenameMapDialog.DIALOG_ID + "Ok";
RenameMapDialog.INPUT_FIELD_ID = RenameMapDialog.DIALOG_ID + "InputField";
RenameMapDialog.MAP_LIST_PREFIX = RenameMapDialog.DIALOG_ID;

/**
 * Close this Dialog:
 *    - Make the global popups div hidden
 *    - Delete the RenameMapDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
RenameMapDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._renameMapDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * KeyPress
 * Rename if return key pressed.
 *
 * @param {Event} e - the Event object associated with this key press
 * @param {[{String, String}]} mapList - the complete map list from the DB
 * @param {number} indexToRename - the index of the map to be renamed
 * @return {void}
 */
RenameMapDialog.prototype.keyPress =
   function keyPress(e, mapList, indexToRename) {

   if (e.keyCode === 13) {
      this.renameMap(mapList, indexToRename);
   }
};

/**
 * Ok clicked
 *
 * @param {[{String, String}]} mapList - the complete map list from the DB
 * @param {number} indexToRename - the index of the map to be renamed
 * @return {void}
 */
RenameMapDialog.prototype.renameMap =
   function renameMap(mapList, indexToRename) {

   let newMapListEntry;
   let newName;

   //--------------------------------------------------------------------------
   // Update the name to be saved, and if it's currently being edited, make
   // sure the MapModel is updated.
   //--------------------------------------------------------------------------
   newName = document.getElementById(RenameMapDialog.INPUT_FIELD_ID).value;
   if (newName !== mapList[indexToRename].name) {
      if (m3App.getController().getMapModel().getDbKey() ===
             mapList[indexToRename].key) {
         m3App.getController().getMapModel().setMapName(newName);
      }

      newMapListEntry = {key: mapList[indexToRename].key, name: newName};
      mapList.splice(indexToRename, 1, newMapListEntry);

      App.myDB.setItem(App.KEY_MAPLIST, mapList).then( () => {
         this.close();

      }).catch( (err) => {
         let error = new ErrorDialog("Error trying to rename map from " +
            `${mapList[indexToRename].name} to ${newName}: ${err}`);
      });
   }
}; // renameMap()
