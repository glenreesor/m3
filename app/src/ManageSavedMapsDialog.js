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

import {App} from "./App";
import {ErrorDialog} from "./ErrorDialog";
import {m3App} from "./main";
import {RenameMapDialog} from "./RenameMapDialog";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A ManageSavedMapsDialog object will handle displaying all saved maps and
 * allowing the user to rename or delete them
 *
 * @constructor
 */
export function ManageSavedMapsDialog() {
   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${ManageSavedMapsDialog.DIALOG_ID}' class='popup' style='height: ${Sizer.popupHeight}px'>` +
          "   <p style='text-align: center; font-weight: bold;'>Saved Maps</p>";

   // Add the list of saved maps
   App.myDB.getItem(App.KEY_MAPLIST).then((mapList) => {
      mapList.forEach(function(map) {
         html += `   <span>${map.name}</span>` +
                 `      <button id='${ManageSavedMapsDialog.RENAME_ID_PREFIX}${map.key}'>Rename</button>` +
                 `      <button id='${ManageSavedMapsDialog.DELETE_ID_PREFIX}${map.key}'>` +
                 `Delete</button><br><br>`;
      });

      // Add closing tags
      html += `   <button id='${ManageSavedMapsDialog.CANCEL_ID}'>Cancel</button>` +
              "</div>";

      //--------------------------------------------------------------------------
      // Create the dialog
      //--------------------------------------------------------------------------
      domParser = new DOMParser();
      htmlAsDoc = domParser.parseFromString(html, "text/html");
      this._manageSavedMapsDialog = document.importNode(htmlAsDoc.getElementById(ManageSavedMapsDialog.DIALOG_ID), true);
      document.getElementById("app-popups").appendChild(this._manageSavedMapsDialog);

      //--------------------------------------------------------------------------
      // Add the event listeners
      //--------------------------------------------------------------------------
      mapList.forEach((map, index) => {
         // Note: Pass the mapList to event handlers because so they don't have
         //       to query the DB again
         document.getElementById(`${ManageSavedMapsDialog.RENAME_ID_PREFIX}${map.key}`).addEventListener("click", () => this.renameMap(mapList, index));
         document.getElementById(`${ManageSavedMapsDialog.DELETE_ID_PREFIX}${map.key}`).addEventListener("click", () => this.deleteMap(mapList, index));
      });

      document.getElementById(ManageSavedMapsDialog.CANCEL_ID).addEventListener("click", () => this.close());

      //--------------------------------------------------------------------------
      // Finally, make the app-popups div visible and set state
      //--------------------------------------------------------------------------
      document.getElementById("app-popups").removeAttribute("hidden");
      m3App.getGlobalState().setState(State.STATE_DIALOG_MANAGE_SAVED_MAPS);
   }).catch(function (err) {
      let errorDialog = new ErrorDialog("Unable to load list of saved maps: " + err);
   });
} // ManageSavedMapsDialog()

ManageSavedMapsDialog.DIALOG_ID = "m3-manageSavedMapsDialog";
ManageSavedMapsDialog.CANCEL_ID = ManageSavedMapsDialog.DIALOG_ID + "Cancel";
ManageSavedMapsDialog.DELETE_ID_PREFIX = ManageSavedMapsDialog.DIALOG_ID + "D";
ManageSavedMapsDialog.RENAME_ID_PREFIX = ManageSavedMapsDialog.DIALOG_ID + "R";

/**
 * Close this ManageSavedMaps Dialog:
 *    - Make the global popups div hidden
 *    - Delete the LoadDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
ManageSavedMapsDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._manageSavedMapsDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * Delete the clicked map
 * @param {String[]} mapList - the list of maps in the DB
 * @param {number} indexToDelete - the index of the map to delete
 * @return {void}
 */
ManageSavedMapsDialog.prototype.deleteMap = function deleteMap(mapList, indexToDelete) {
   let error;

   if (mapList[indexToDelete].key === m3App.getController().getMapModel().getDbKey()) {
      this.close();
      error = new ErrorDialog("Error: Cannot delete map being edited");

   } else {
      App.myDB.removeItem(mapList[indexToDelete].key).then(() => {
         mapList.splice(indexToDelete, 1);
         return App.myDB.setItem(App.KEY_MAPLIST, mapList);

      }).then( () => {
         this.close();

      }).catch( (err) => {
         error = new ErrorDialog("Error trying to delete map " +
               `"${mapList[indexToDelete].name}" with key ${mapList[indexToDelete].key}: ${err}`);
      });

   }
}; // deleteMap()

/**
 * Rename the clicked map
 * @param {String[]} mapList - the list of maps in the DB
 * @param {number} indexToRename - the index of the map to rename
 * @return {void}
 */
ManageSavedMapsDialog.prototype.renameMap = function renameMap(mapList, indexToRename) {
   let renameMapDialog;

   this.close();
   renameMapDialog = new RenameMapDialog(mapList, indexToRename);
}; // renameMap()
