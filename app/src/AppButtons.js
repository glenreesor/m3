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

import {AboutDialog} from "./AboutDialog";
import {ImportExportDialog} from "./ImportExportDialog";
import {LoadDialog} from "./LoadDialog";
import {m3App} from "./main";
import {ManageSavedMapsDialog} from "./ManageSavedMapsDialog";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * A AppButtons object is a singleton that will create all the app buttons
 * placed outside of the mindmap area.
 *
 * @constructor
 * @param {Controller} controller - The controller for this app
 */
export function AppButtons(controller) {
   let buttonsDivBottom;
   let buttonsDivRight;
   let domParser;
   let htmlAsDoc;
   let buttonsHtmlBottom;
   let buttonsHtmlRight;

   this._controller = controller;

   buttonsHtmlBottom = `<div id='buttonsHtmlBottom' style='position: fixed;` +
                        `bottom: ${Sizer._MARGINS.appMarginBottom}px; ` +
                        `right: ${Sizer._MARGINS.appMarginRight + Sizer._SIDE_ICONS_WIDTH}px;'>` +
                     "   <img id='about'        style='margin-right: 10px' class='clickableIcon' src='images/info.svg'          height='32px'></img>" +
                     "   <img id='importExport' style='margin-right: 10px' class='clickableIcon' src='images/import-export.svg' height='32px'></img>" +
                     "   <img id='manage'       style='margin-right: 10px' class='clickableIcon' src='images/manage.svg'        height='32px'></img>" +
                     "   <img id='save'         style='margin-right: 10px' class='clickableIcon' src='images/save.svg'          height='32px'></img>" +
                     "   <img id='load'                                    class='clickableIcon' src='images/load.svg'          height='32px'></img>" +
                     "</div>";

   buttonsHtmlRight = "<div id='buttonsHtmlRight' style='position: fixed; right: " +
                           Sizer._MARGINS.appMarginRight + "px; bottom: " + Sizer._MARGINS.appMarginBottom + "px;'>" +
                      "   <img id='delete-node' style='margin-bottom: 10px' class='clickableIcon' src='images/delete.svg'      width='32px'><br>" +
                      "   <img id='cloud'       style='margin-bottom: 10px' class='clickableIcon' src='images/cloud.svg'       width='32px'><br>" +
                      "   <img id='add-child'   style='margin-bottom: 10px' class='clickableIcon' src='images/add-child.svg'   width='32px'><br>" +
                      "   <img id='add-sibling' style='margin-bottom: 10px' class='clickableIcon' src='images/add-sibling.svg' width='32px'><br>" +
                      "   <img id='edit-node'   style='margin-bottom: 10px' class='clickableIcon' src='images/edit.svg'        width='32px'>" +
                      "</div>";
   //--------------------------------------------------------------------------
   // Add the left buttons
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(buttonsHtmlBottom, "text/html");
   this._buttonsDivBottom = document.importNode(htmlAsDoc.getElementById("buttonsHtmlBottom"), true);
   document.getElementById("app").appendChild(this._buttonsDivBottom);

   //--------------------------------------------------------------------------
   // Add the right buttons
   //--------------------------------------------------------------------------
   htmlAsDoc = domParser.parseFromString(buttonsHtmlRight, "text/html");
   this._buttonsDivRight = document.importNode(htmlAsDoc.getElementById("buttonsHtmlRight"), true);
   document.getElementById("app").appendChild(this._buttonsDivRight);

   //--------------------------------------------------------------------------
   // Safari doesn't show the active pseudo class unless the corresponding
   // object has a touchstart event handler.
   //--------------------------------------------------------------------------
   document.getElementById("about").addEventListener("touchstart", () => {});
   document.getElementById("importExport").addEventListener("touchstart", () => {});
   document.getElementById("manage").addEventListener("touchstart", () => {});
   document.getElementById("load").addEventListener("touchstart", () => {});
   document.getElementById("save").addEventListener("touchstart", () => {});
   document.getElementById("delete-node").addEventListener("touchstart", () => {});
   document.getElementById("cloud").addEventListener("touchstart", () => {});
   document.getElementById("add-child").addEventListener("touchstart", () => {});
   document.getElementById("add-sibling").addEventListener("touchstart", () => {});
   document.getElementById("edit-node").addEventListener("touchstart", () => {});

   //--------------------------------------------------------------------------
   // Add listeners for left buttons (these are app-level)
   // Listeners for the current map (add node, etc) are added in MapView
   //--------------------------------------------------------------------------
   document.getElementById("about").addEventListener("click", () => this.about());
   document.getElementById("importExport").addEventListener("click", () => this.importExport());
   document.getElementById("manage").addEventListener("click", () => this.manage());
   document.getElementById("load").addEventListener("click", () => this.load());
   document.getElementById("save").addEventListener("click", () => controller.getMapModel().save());
}

/**
 * About button clicked
 *
 * @return {void}
 */
AppButtons.prototype.about = function about() {
   let aboutDialog;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      aboutDialog = new AboutDialog();
   }
}; // about()

/**
 * ImportExport button clicked
 *
 * @return {void}
 */
AppButtons.prototype.importExport = function importExport() {
   let importExportDialog;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      importExportDialog = new ImportExportDialog();
   }
}; // importExport()

/**
 * Manage button clicked
 *
 * @return {void}
 */
AppButtons.prototype.manage = function manage() {
   let manageSavedMapsDialog;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      manageSavedMapsDialog = new ManageSavedMapsDialog();
   }
}; // manage()

/**
 * Load button clicked
 *
 * @return {void}
 */
AppButtons.prototype.load = function load() {
   let loadDialog;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      loadDialog = new LoadDialog(this._controller);
   }
}; // load()

/**
 * Remove buttons. This is a hack until I implement the controller properly
 *
 * @return {void}
 */
AppButtons.prototype.remove = function remove() {
   document.getElementById("app").removeChild(this._buttonsDivBottom);
   document.getElementById("app").removeChild(this._buttonsDivRight);
}; // remove()
