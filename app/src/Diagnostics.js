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

/**
 * Diagnostics formatter that can send output to different locations
 * (possibly none) depending on the type of task being performed. Only
 * expecting one instance of this object.
 *
 * @constructor
 */
export function Diagnostics() {
   this._LOG_TYPE = {TASK_IMPORT_XML  : "none",
                     TASK_VIEWS       : "none",
                     TASK_VIEW_STATE  : "none"};

   this._WARN_TYPE = {TASK_IMPORT_XML : "console",
                      TASK_VIEWS      : "none",
                      TASK_VIEW_STATE : "none"};

   this._ERR_TYPE = {TASK_IMPORT_XML  : "alert",
                     TASK_VIEWS       : "alert",
                     TASK_VIEW_STATE  : "alert"};

   this._popupWindow = null;
} // Diagnostics()

// Note: These strings must be the same as the identifier in the *_TYPE arrays
//       in the constructor
Diagnostics.TASK_IMPORT_XML   = "TASK_IMPORT_XML";
Diagnostics.TASK_VIEWS        = "TASK_VIEWS";
Diagnostics.TASK_VIEW_STATE   = "TASK_VIEW_STATE";

/**
 * Print an error message associated with the specified task.
 *
 * @param {string} task - The task that was being performed.
 * @param {string} msg   - The message to print.
 * @return {void}
 */
Diagnostics.prototype.err = function err(task, msg) {
   let fullMsg = task + ": " + msg;

   if (this._ERR_TYPE[task] === "console") {
      console.err(fullMsg);

   } else if (this._ERR_TYPE[task] === "alert") {
      alert("ERR : " + fullMsg);

   } else if (this._ERR_TYPE[task] === "popup") {
      this._popupMsg("ERR : " + fullMsg);
   }
}; // err()

/**
 * Print a log message associated with the specified task.
 *
 * @param {string} task - The task that was being performed.
 * @param {string} msg - The message to print.
 * @return {void}
 */
Diagnostics.prototype.log = function log(task, msg) {
   let fullMsg = task + ": " + msg;

   if (this._LOG_TYPE[task] === "console") {
      console.log(fullMsg);

   } else if (this._LOG_TYPE[task] === "alert") {
      alert("Log : " + fullMsg);

   } else if (this._LOG_TYPE[task] === "popup") {
      this._popupMsg("Log : " + fullMsg);
   }
}; // log()

/**
 * Print a warning message associated with the specified task.
 *
 * @param {string} task - The task that was being performed.
 * @param {string} msg - The message to print.
 * @return {void}
 */
Diagnostics.prototype.warn = function warn(task, msg) {
   let fullMsg = task + ": " + msg;

   if (this._WARN_TYPE[task] === "console") {
      console.warn(fullMsg);

   } else if (this._WARN_TYPE[task] === "alert") {
      alert("Warn: " + fullMsg);

   } else if (this._WARN_TYPE[task] === "popup") {
      this._popupMsg("Warn: " + fullMsg);
   }
}; // warn()

/**
 * Print the specified message in a popup window. If a popup window already
 * exists, the message will be added to it rather than creating a new window.
 *
 * @param {string} msg - The message to print.
 * @return {void}
 */
Diagnostics.prototype._popupMsg = function _popupMsg(msg) {
   let doc;
   let bodyElement;
   let newMsgElement;

   if (this._popupWindow === null) {
      this._popupWindow = window.open("", "Diagnostics");
   }

   doc = this._popupWindow.document;
   bodyElement = doc.getElementsByTagName("body")[0];

   newMsgElement = doc.createElement("code");
   newMsgElement.appendChild(doc.createTextNode(msg));
   bodyElement.appendChild(newMsgElement);

   bodyElement.appendChild(doc.createElement("br"));
}; // popUpMsg
