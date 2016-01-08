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

/**
 * A SaveDialog object will handle displaying a dialog to save the current map
 * and then trigger the actual saving.
 *
 * @constructor
 */
function SaveDialog() {
   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${SaveDialog.DIALOG_ID}' class='popup' style='height: ${Sizer.popupHeight}px'>` +
          "   <p style='text-align: center; font-weight: bold'>Save Map</p>";

   // Add the list of saved maps
   App.myDB.getItem(App.KEY_MAPLIST).then((mapList) => {
      mapList.forEach(function(map) {
         html += `   <p>${map.name}</p>`;
      });

      // Allow them to specify the name
      html += `   <input type='text' id='${SaveDialog.INPUT_FIELD_ID}'` +
                         `size='20' value='${m3App.getController().getMapModel().getMapName()}'/>`;

      // Add the buttons
      html += `   <br><br><button id='${SaveDialog.SAVE_ID}'>Save</button>` +
              `   <button id='${SaveDialog.CANCEL_ID}'>Cancel</button>` +
              "</div>";

      //--------------------------------------------------------------------------
      // Create the dialog
      //--------------------------------------------------------------------------
      domParser = new DOMParser();
      htmlAsDoc = domParser.parseFromString(html, "text/html");
      this._saveDialog = document.importNode(htmlAsDoc.getElementById(SaveDialog.DIALOG_ID), true);
      document.getElementById("app-popups").appendChild(this._saveDialog);

      //--------------------------------------------------------------------------
      // Add our listeners
      //--------------------------------------------------------------------------
      document.getElementById(SaveDialog.SAVE_ID).addEventListener("click", () => this.saveMap());
      document.getElementById(SaveDialog.CANCEL_ID).addEventListener("click", () => this.close());
      document.getElementById(SaveDialog.INPUT_FIELD_ID).addEventListener("keypress", (e) => this.keyPress(e));

      //--------------------------------------------------------------------------
      // Finally, make the app-popups div visible and set state
      //--------------------------------------------------------------------------
      document.getElementById("app-popups").removeAttribute("hidden");
      m3App.getGlobalState().setState(State.STATE_DIALOG_SAVE);

      //--------------------------------------------------------------------------
      // Select all text and give it focus
      //--------------------------------------------------------------------------
      (document.getElementById(SaveDialog.INPUT_FIELD_ID)).select();
      (document.getElementById(SaveDialog.INPUT_FIELD_ID)).focus();
   });
} // SaveDialog()

SaveDialog.DIALOG_ID = "m3-saveDialog";
SaveDialog.CANCEL_ID = SaveDialog.DIALOG_ID + "Cancel";
SaveDialog.SAVE_ID = SaveDialog.DIALOG_ID + "Save";
SaveDialog.INPUT_FIELD_ID = SaveDialog.DIALOG_ID + "InputField";

/**
 * Close this Save Dialog:
 *    - Make the global popups div hidden
 *    - Delete the SaveDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
SaveDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._saveDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()

/**
 * KeyPress
 * Save and close if return key pressed.
 *
 * @param {Event} e - the Event object associated with this key press
 * @return {void}
 */
SaveDialog.prototype.keyPress = function keyPress(e) {
   if (e.keyCode === 13) {
      this.saveMap();
   }
};

/**
 * Save clicked
 *
 * @return {void}
 */
SaveDialog.prototype.saveMap = function saveMap() {
   let mapKey;
   let saveName;

   //----------------------------------------------------------------------
   // Update the name to be saved, and make sure the MapModel is updated.
   //----------------------------------------------------------------------
   saveName = document.getElementById(SaveDialog.INPUT_FIELD_ID).value;
   m3App.getController().getMapModel().setMapName(saveName);

   //----------------------------------------------------------------------
   // Determine the DB key to use when saving (it'll be null if it hasn't
   // been saved yet)
   //----------------------------------------------------------------------
   mapKey = m3App.getController().getMapModel().getDbKey();

   if (mapKey === null) {
      mapKey = `map-${Date.now()}`;
   }

   //----------------------------------------------------------------------
   // Save the current map
   //----------------------------------------------------------------------
   App.myDB.setItem(mapKey, m3App.getController().getMapModel().getAsXml()).then( () => {
      m3App.getController().getMapModel().setModifiedStatus(false);
      return App.myDB.getItem(App.KEY_MAPLIST);

   }).then( (mapList) => {
      // If this hadn't been saved before, then update the mapList
      if (m3App.getController().getMapModel().getDbKey() === null) {
         m3App.getController().getMapModel().setDbKey(mapKey);
         mapList.push({key: mapKey, name: saveName});
      }

      return App.myDB.setItem(App.KEY_MAPLIST, mapList);

   }).then( () => {
      // Close here as feedback to user that saving has completed.
      this.close();

   }).catch( (err) => {
      let error = new ErrorDialog("Error saving map: " + err);
   });

}; // saveMap()
