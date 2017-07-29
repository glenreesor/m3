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
import {m3App} from "./main";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * An ErrorDialog object displays the specified error message.
 * @constructor
 * @param {String} errorMsg - The error message to be displayed
 */
export function ErrorDialog(errorMsg) {
   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${ErrorDialog.DIALOG_ID}' class='popup' style='height: ` +
             `${Sizer.popupHeight}px'>` +
             "<p style='text-align: center; font-weight: bold;'>" +
             `${App.MY_NAME} - Error</p>` +
             "<p>" + errorMsg + "</p>" +
             `<button id='${ErrorDialog.OK_ID}'>Ok</button>` +
          "</div>";

   //--------------------------------------------------------------------------
   // Create the dialog
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._errorDialog = document.importNode(
      htmlAsDoc.getElementById(ErrorDialog.DIALOG_ID), true);
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._errorDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(ErrorDialog.OK_ID).addEventListener("click",
      () => this.close());

   //--------------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_ERROR);
} // ErrorDialog()

ErrorDialog.DIALOG_ID = `${App.HTML_ID_PREFIX}-errorDialog`;
ErrorDialog.OK_ID = ErrorDialog.DIALOG_ID + "Ok";

/**
 * Close this Error Dialog:
 *    - Make the global popups div hidden
 *    - Delete the errorDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
ErrorDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._errorDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()
