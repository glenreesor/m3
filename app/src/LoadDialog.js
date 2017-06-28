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
import {ErrorDialog} from "./ErrorDialog";
import {m3App} from "./main";
import {m3SampleXml} from "./m3SampleXml";
import {MapModel} from "./MapModel";
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
   this._controller = controller;


   App.myDB.getItem(App.KEY_MAPLIST).then(
      (mapList) => this.createMarkup(mapList)
   ).catch(function (err) {
      let errorDialog = new ErrorDialog("Unable to load list of saved maps: " +
                                        err);
   });
} // LoadDialog()

LoadDialog.DIALOG_ID = `${App.HTML_ID_PREFIX}-loadDialog`;
LoadDialog.CANCEL_ID = LoadDialog.DIALOG_ID + 'Cancel';
LoadDialog.NEW_MAP_ID = LoadDialog.DIALOG_ID + 'NewMap';
LoadDialog.SAMPLE_ID = LoadDialog.DIALOG_ID + 'Sample';

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

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._loadDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * Create the markup using the specified list of saved maps
 *
 * @param  {Array[]} savedMaps - An array representing user's saved
 *                               maps, where each element is an object
 *                               with key and name fields
 * @return {void}
 */
LoadDialog.prototype.createMarkup = function createMarkup(savedMaps) {
   const KEY_ATTRIBUTE = 'data-map-key';
   const NAME_ATTRIBUTE = 'data-map-name';
   const URL_ATTRIBUTE = 'data-map-url';

   let allClickableMaps;
   let domParser;
   let i;
   let loadableMaps;
   let mapsSelector;
   let html;
   let htmlAsDoc;

   //-----------------------------------------------------------------------
   // Create the markup
   //-----------------------------------------------------------------------
   html = `
      <div
         id="${LoadDialog.DIALOG_ID}"
         class="popup"
         style="height:${Sizer.popupHeight}px"
      >
         <p
            style="text-align: center; font-weight: bold;"
         >
            Load Map
         </p>
   `;

   // Warn the user if current map hasn't been saved
   if (this._controller.getMapModel().getModifiedStatus()) {
      html += '<p> Warning: Current map has unsaved changes.</p>';
   }

   html += `
      <span
         class="clickableText"
         ${KEY_ATTRIBUTE}="${LoadDialog.NEW_MAP_ID}"
         ${NAME_ATTRIBUTE}=""
         ${URL_ATTRIBUTE}=""
      >
         New Map
      </span>
      <br>
   `;

   html += '<p><b> Saved Maps </b></p>';

   //-------------------------------------------------------------------------
   // User's saved maps
   //-------------------------------------------------------------------------
   savedMaps.forEach(function(map) {
      html += `
         &nbsp; &nbsp; &nbsp;
         <span
            class="clickableText"
            ${KEY_ATTRIBUTE}="${map.key}"
            ${NAME_ATTRIBUTE}="${map.name}"
            ${URL_ATTRIBUTE}=""
         >
            ${map.name}
         </span><br><br>
      `;
   });

   //-------------------------------------------------------------------------
   // Pre-loaded maps
   //-------------------------------------------------------------------------
   html += `<p><b> Pre-Loaded Maps </b></p>`;

   html += `
      &nbsp; &nbsp; &nbsp;
      <span
         class="clickableText"
         ${KEY_ATTRIBUTE}="${LoadDialog.SAMPLE_ID}"
         ${NAME_ATTRIBUTE}="m3 Sample"
         ${URL_ATTRIBUTE}=""
      >
         m3 Sample
      </span><br><br>
   `;

   loadableMaps = m3App.getLoadableMaps();
   loadableMaps.forEach(function(map) {
      if (!map.url) {
         // No URL, thus show as a heading
         html += `
            &nbsp; &nbsp; &nbsp;
            <span><b> ${map.name} </b></span><br><br>
         `;
      } else {
         html += `
            &nbsp; &nbsp; &nbsp;
            <span
               class="clickableText"
               ${KEY_ATTRIBUTE}=""
               ${NAME_ATTRIBUTE}="${map.name}"
               ${URL_ATTRIBUTE}="${map.url}"
            >
               ${map.name}
            </span><br><br>
         `;
      }
   });

   //-----------------------------------------------------------------------
   // Add closing tags
   //-----------------------------------------------------------------------
   html += `
         <button
            id='${LoadDialog.CANCEL_ID}'
         >
            Cancel
         </button>
      </div>
   `;

   //-----------------------------------------------------------------------
   // Create the dialog
   //-----------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, 'text/html');
   this._loadDialog = document.importNode(
      htmlAsDoc.getElementById(LoadDialog.DIALOG_ID),
      true
   );

   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._loadDialog);

   //-----------------------------------------------------------------------
   // Add the event listeners
   //-----------------------------------------------------------------------
   document.getElementById(LoadDialog.CANCEL_ID).addEventListener(
      'click',
      () => this.close()
   );

   mapsSelector = `#${LoadDialog.DIALOG_ID} span.clickableText`;

   allClickableMaps = document.querySelectorAll(mapsSelector);

   // Using a loop because iOS can't do forEach() on a NodeList
   for (i = 0; i < allClickableMaps.length; i++) {
      allClickableMaps[i].addEventListener(
         'click',
         (e) => this.loadMap(
            e.target.attributes[`${KEY_ATTRIBUTE}`].value,
            e.target.attributes[`${NAME_ATTRIBUTE}`].value,
            e.target.attributes[`${URL_ATTRIBUTE}`].value
         )
      );
   }

   //-----------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //-----------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_LOAD);
}; // createMarkup()

/**
 * Load the clicked map. The map will either be from the DB
 * (if mapKey is not "") or the server (if mapUrl is not "")
 *
 * @param {String} mapKey  - the DB key used for this map, "" if not from DB
 * @param {String} mapName - the name of this map
 * @param {String} mapUrl  - the URL for this map, possibly ""
 * @return {void}
 */
LoadDialog.prototype.loadMap = function loadMap(mapKey, mapName, mapUrl) {
   let error;
   let httpRequest;

   if (mapKey === LoadDialog.NEW_MAP_ID) {
      this._controller.newMap(MapModel.TYPE_EMPTY,  null, "New Map", null);
      this.close();
      this._controller.selectRootNode();

   } else if (mapKey === LoadDialog.SAMPLE_ID) {
      this._controller.newMap(MapModel.TYPE_XML,  null, "m3 Sample",
                              m3SampleXml);
      this.close();
      this._controller.selectRootNode();

   } else if (mapKey !== '') {
      App.myDB.getItem(mapKey).then( (mapAsXml) => {
         this._controller.newMap(MapModel.TYPE_XML, mapKey, mapName, mapAsXml);
         this.close();
         this._controller.selectRootNode();
      }).catch( (err) => {
         this.close();
         error = new ErrorDialog(`Error loading map '${mapName}'` +
                                     `using key '${mapKey}'': ` +
                                     `${err} ${err.stack}`);
      });
   } else if (mapUrl !== '') {
      m3App.getMapFromUrl(
         mapUrl,
         function (mapContents) {
            this._controller.newMap(
               MapModel.TYPE_XML,
               null,
               mapName,
               mapContents
            );
         }.bind(this)
      );
      this.close();
      this._controller.selectRootNode();

   } else {
      error = new ErrorDialog('Error: Unknown error loading map.');
   }
}; // loadMap()
