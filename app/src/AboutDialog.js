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
import {m3App} from "./main";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * An AboutDialog object displays information about this m3App.
 *
 * @constructor
 */
export function AboutDialog() {
   let domParser;
   let html;
   let htmlAsDoc;

   //--------------------------------------------------------------------------
   // Tags to be added
   //--------------------------------------------------------------------------
   html = `<div id='${AboutDialog.DIALOG_ID}' class='popup' style='height: ` +
             `${Sizer.popupHeight}px'>` +
            "<p style='text-align: center; font-weight: bold;'>" +
              `${App.MY_NAME}</p>` +
            "<p style='text-align: center;'>Version: " +
              `${m3App.getVersionAsString()}</p>` +
            "<p style='text-align: center;'>Copyright 2015, 2016 - " +
              "Glen Reesor</p>" +
            "<p style='font-weight: bold;'>Source Code</p>" +
            "<ul>" +
               "<li><a href='http://github.com/glenreesor/m3' " +
                  "target='_blank'>" +
                  "github.com/glenreesor/m3</a>" +
               "</li></ul>" +
            "<p style='font-weight: bold;'>Libraries</p>" +
            "<ul><li>localForage (Mozilla)</li></ul>" +
            "<p style='font-weight: bold;'>Icons</p>" +
            "<ul>" +
              "<li>User b.gaultier at openclipart.org</li>" +
              "<li>User warszawianka at openclipart.org</li>" +
              "<li>User netalloy at openclipart.org</li>" +
            "</ul>" +
            "<p style='font-weight: bold;'License</p>" +
            "<p style='font-size: 8pt'>" +
               "Mobile Mind Mapper is free software: you can redistribute " +
               "it and/or modify it under the terms of the GNU General " +
               "Public License, version 3, as published by the Free " +
               "Software Foundation.</p>" +
            "<p style='font-size: 8pt'>" +
               "Mobile Mind Mapper is distributed in the hope that it " +
               "will be useful, but WITHOUT ANY WARRANTY; without even " +
               "the implied warranty of MERCHANTABILITY or FITNESS FOR A " +
               "PARTICULAR PURPOSE.  See the GNU General Public License " +
               "for more details.</p>" +
            "<p style='font-size: 8pt'>" +
               "You should have received a copy of the GNU General " +
               "Public License along with Mobile Mind Mapper.  If not, " +
               "see <a target='_blank' " +
               "href=http://www.gnu.org/licenses/>" +
               "http://www.gnu.org/licenses/</a>." +
            "</p>" +
            `<button id='${AboutDialog.OK_ID}'>Ok</button>` +
          "</div>";

   //--------------------------------------------------------------------------
   // Create the dialog
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, "text/html");
   this._aboutDialog = document.importNode(
      htmlAsDoc.getElementById(AboutDialog.DIALOG_ID), true);
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._aboutDialog);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(AboutDialog.OK_ID).addEventListener(
      "click", () => this.close());

   //--------------------------------------------------------------------------
   // Finally, make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute("hidden");
   m3App.getGlobalState().setState(State.STATE_DIALOG_ABOUT);
} // AboutDialog()

AboutDialog.DIALOG_ID = "m3-aboutDialog";
AboutDialog.OK_ID = AboutDialog.DIALOG_ID + "Ok";

/**
 * Close this About Dialog:
 *    - Make the global popups div hidden
 *    - Delete the AboutDialog div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
AboutDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute("hidden", "true");
   appPopups.removeChild(this._aboutDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);
}; // close()
