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

import {m3App} from "./main";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A EditNodeDialog object will handle displaying a dialog to edit node text
 * (just node text--not rich text)
 *
 * @constructor
 * @param {Controller} controller - The controller for the app
 * @param {NodeModel} nodeToEdit - The node that is being edited.
 */
export function EditNodeDialog(controller, nodeToEdit) {
   this._controller = controller;
   this._nodeToEdit = nodeToEdit;

   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${EditNodeDialog.DIALOG_ID}' class='popup' ` +
             `style='height: ${Sizer.popupHeight}px'> <p> Edit Node </p>` +
             `<input type='text' id='${EditNodeDialog.TEXT_ENTRY_FIELD_ID}' ` +
             "size='20'/><br><br>" +
             `<button id='${EditNodeDialog.SAVE_ID}'>Save</button>` +
             `<button id='${EditNodeDialog.CANCEL_ID}'>Cancel</button>` +
          "</div>";

   //--------------------------------------------------------------------------
   // Create the dialog
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._editNodeDialog = document.importNode(
      htmlAsDoc.getElementById(EditNodeDialog.DIALOG_ID), true);
   document.getElementById("app-popups").appendChild(this._editNodeDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(EditNodeDialog.SAVE_ID).addEventListener("click",
      () => this.save());
   document.getElementById(EditNodeDialog.CANCEL_ID).addEventListener("click",
      () => this.close());
   document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID)
      .addEventListener("keypress", (e) => this.keyPress(e));

   //--------------------------------------------------------------------------
   // Make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById("app-popups").removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_EDIT_NODE);

   //--------------------------------------------------------------------------
   // Populate the input field, give it focus, and select all the text
   //--------------------------------------------------------------------------
   (document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID)).value =
      this._nodeToEdit.getText();
   (document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID)).select();
   (document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID)).focus();
} // EditNodeDialog()

EditNodeDialog.DIALOG_ID = "m3-editNodeDialog";

EditNodeDialog.CANCEL_ID = EditNodeDialog.DIALOG_ID + "Cancel";
EditNodeDialog.TEXT_ENTRY_FIELD_ID = EditNodeDialog.DIALOG_ID + "TextEntry";
EditNodeDialog.SAVE_ID = EditNodeDialog.DIALOG_ID + "Save";

/**
 * Close this EditNode Dialog:
 *    - Make the global popups div hidden
 *    - Delete the EditNode div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
EditNodeDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById("app-popups");
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._editNodeDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);

   // Making the edited node the currently selected one means the user
   // can use addchild or addSibling to create anything without having
   // to select a different node first.
   this._controller.getMapViewController().setSelectedNodeView(
      this._nodeToEdit.getView());
}; // close()

/**
 * KeyPress
 * Save and close if return key pressed.
 *
 * @param {Event} e - The event object for this keypress
 * @return {void}
 */
EditNodeDialog.prototype.keyPress = function keyPress(e) {
   if (e.keyCode === 13) {
      this.save();
   }

}; // keyPress()
/**
 * Save clicked
 *
 * @return {void}
 */
EditNodeDialog.prototype.save = function save() {
   this._controller.changeNodeText(this._nodeToEdit,
      document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID).value);
   this.close();
}; // save()
