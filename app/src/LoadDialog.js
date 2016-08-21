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
import {m3SampleXml} from "./m3SampleXml";
import {MapModel} from "./MapModel";
import {RenameMapDialog} from "./RenameMapDialog";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A LoadDialog object will handle displaying a dialog to load a saved map
 * and then trigger the actual loading.
 *
 * @constructor
 * @param {Controller} controller - this app's controller
 */
export function LoadDialog(controller) {
   let domParser;
   let html;
   let htmlAsDoc;

   this._controller = controller;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${LoadDialog.DIALOG_ID}' class='popup' style='height: ` +
             `${Sizer.popupHeight}px'>` +
             "<p style='text-align: center; font-weight: bold;'>Load Map</p>";

   // Warn the user if current map hasn't been saved
   if (this._controller.getMapModel().getModifiedStatus()) {
      html += "<p> Warning: Current map has unsaved changes.</p>";
   }

   // Add the list of saved maps
   App.myDB.getItem(App.KEY_MAPLIST).then((mapList) => {
      mapList.forEach(function(map) {
         html += `<p id=${RenameMapDialog.MAP_LIST_PREFIX}${map.key} ` +
                 `class='clickableText'>${map.name}</p>`;
      });

      // Add the sample map
      html += "<hr>" +
              `<p id='${LoadDialog.SAMPLE_ID}' class='clickableText'>` +
              "m3 Sample</p>" +
              `<p id='${LoadDialog.NEW_MAP_ID}' ` +
              "class='clickableText'>New Map</p>";

      // Add closing tags
      html += `   <button id='${LoadDialog.CANCEL_ID}'>Cancel</button>` +
              "</div>";

      //-----------------------------------------------------------------------
      // Create the dialog
      //-----------------------------------------------------------------------
      domParser = new DOMParser();
      htmlAsDoc = domParser.parseFromString(html, "text/html");
      this._loadDialog = document.importNode(htmlAsDoc
         .getElementById(LoadDialog.DIALOG_ID), true);

      document.getElementById("app-popups").appendChild(this._loadDialog);

      //-----------------------------------------------------------------------
      // Add the event listeners
      //-----------------------------------------------------------------------
      mapList.forEach((map) => {
         document.getElementById(RenameMapDialog.MAP_LIST_PREFIX + map.key)
            .addEventListener("click", () => this.loadMap(map.key, map.name));
      });
      document.getElementById(LoadDialog.SAMPLE_ID).addEventListener("click",
         () => this.loadMap(LoadDialog.SAMPLE_ID, "m3 Sample"));

      document.getElementById(LoadDialog.NEW_MAP_ID).addEventListener("click",
         () => this.loadMap(LoadDialog.NEW_MAP_ID, ""));

      document.getElementById(LoadDialog.CANCEL_ID).addEventListener("click",
         () => this.close());

      //-----------------------------------------------------------------------
      // Finally, make the app-popups div visible and set state
      //-----------------------------------------------------------------------
      document.getElementById("app-popups").removeAttribute("hidden");
      m3App.getGlobalState().setState(State.STATE_DIALOG_LOAD);
   }).catch(function (err) {
      let errorDialog = new ErrorDialog("Unable to load list of saved maps: " +
                                        err);
   });
} // LoadDialog()

LoadDialog.DIALOG_ID = "m3-loadDialog";
LoadDialog.CANCEL_ID = LoadDialog.DIALOG_ID + "Cancel";
LoadDialog.NEW_MAP_ID = LoadDialog.DIALOG_ID + "NewMap";
LoadDialog.SAMPLE_ID = LoadDialog.DIALOG_ID + "Sample";

/**
 * Close this Load Dialog:
 *    - Make the global popups div hidden
 *    - Delete the LoadDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
LoadDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._loadDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * Load the clicked map
 *
 * @param {String} mapKey - the DB key used for this map
 * @param {String} mapName - the name of this map
 * @return {void}
 */
LoadDialog.prototype.loadMap = function loadMap(mapKey, mapName) {
   let newMap;

   if (mapKey === LoadDialog.NEW_MAP_ID) {
      this._controller.newMap(MapModel.TYPE_EMPTY,  null, "New Map", null);
      this.close();
      this._controller.selectRootNode();

   } else if (mapKey === LoadDialog.SAMPLE_ID) {
      this._controller.newMap(MapModel.TYPE_XML,  null, "m3 Sample",
                              m3SampleXml);
      this.close();
      this._controller.selectRootNode();

   } else {
      App.myDB.getItem(mapKey).then( (mapAsXml) => {
         this._controller.newMap(MapModel.TYPE_XML, mapKey, mapName, mapAsXml);
         this.close();
         this._controller.selectRootNode();
      }).catch( (err) => {
         this.close();
         let error = new ErrorDialog(`Error loading map '${mapName}'` +
                                     `using key '${mapKey}'': ` +
                                     `${err} ${err.stack}`);
      });
   }
}; // loadMap()
