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

/**
 * A State object contains state and lets you get and set state.
 *
 * @constructor
 */
export function State() {
   this._state = State.STATE_IDLE;

} // State()

State.STATE_IDLE = "Idle";
State.STATE_DIALOG_ABOUT = "About Dialog";
State.STATE_DIALOG_EDIT_NODE = "Edit Node Dialog";
State.STATE_DIALOG_ERROR = "Error Dialog";
State.STATE_DIALOG_IMPORT_EXPORT = "Import Export Dialog";
State.STATE_DIALOG_LOAD = "Load Dialog";
State.STATE_DIALOG_MANAGE_SAVED_MAPS = "Manage Saved Maps Dialog";
State.STATE_DIALOG_RENAME_MAP = "Rename Map Dialog";
State.STATE_DIALOG_SAVE = "Save Dialog";
State.STATE_EXPORT_POPUP = "Export Popup";

/**
 * Get the current state.
 *
 * @return {String} - Current State
 */
State.prototype.getState = function getState() {
   return this._state;
}; // getState()

/**
 * Set the current state.
 *
 * @param {String} state - Current State (Use State.* constants)
 * @return {void}
 */
State.prototype.setState = function setState(state) {
   this._state = state;
}; // setState()
