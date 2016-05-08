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

import {Controller} from "./Controller";
import {Diagnostics} from "./Diagnostics";
import {ErrorDialog} from "./ErrorDialog";
import {Sizer} from "./Sizer";
import {State} from "./State";

/**
 * This object contains the entire state of the app.
 *
 * @constructor
 */
export function App() {
   this._diagnostics = new Diagnostics();
   this._globalState = new State();

   //--------------------------------------------------------------------------
   // Set window title
   //--------------------------------------------------------------------------
   document.title = App.MY_NAME + " " + this.getVersionAsString();

   //--------------------------------------------------------------------------
   // Prompt user if they navigate away from this page or close the tab/window.
   //--------------------------------------------------------------------------
   window.addEventListener("beforeunload", function(event) {
      event.returnValue = "Are you sure you want to exit?";
      return event;
   });

} // App()

App.DB_NAME = "m3 - Mobile Mind Mapper";
App.KEY_LAST_VERSION_RUN = "lastVersionRun";
App.KEY_MAPLIST = "mapList";

App.myDB = null;                          // This will be populated by _start()
App.MY_NAME = "m3 - Mobile Mind Mapper";
App.MY_VERSION = {major: 0,
                  minor: 9,
                  patch: 999};

/**
 * Return the controller object
 *
 * @return {Controller} - the controller object
 */
App.prototype.getController = function getController() {
   return this._controller;
}; // getController()

/**
 * Return the diagnostics object
 *
 * @return {Diagnostics} - the diagnostics object
 */
App.prototype.getDiagnostics = function getDiagnostics() {
   return this._diagnostics;
}; // getDiagnostics()

/**
 * Return the globalState object
 *
 * @return {State} - the globalState object
 */
App.prototype.getGlobalState = function getGlobalState() {
   return this._globalState;
}; // getGlobalState()

/**
 * Return the current MapModel
 *
 * @return {MapModel} - the current MapModel
 */
App.prototype.getMapModel = function getMapModel() {
   return this._myMapModel;
}; // getMapModel()

/**
 * Return the app version as a string
 *
 * @return {string} - the version of this app formatted as a string.
 */
App.prototype.getVersionAsString = function getVersionAsString() {
   return `${App.MY_VERSION.major}.` +
          `${App.MY_VERSION.minor}.` +
          `${App.MY_VERSION.patch}`;
}; // getAppVersionAsString()

/**
 * Run the app
 * @return {void}
 */
App.prototype.run = function run() {
   this._controller = new Controller();
   this._startup();
   this._sizer = new Sizer();
}; // run()

/**
 * Set the current MapModel
 *
 * @param {MapModel} mapModel the MapModel to be assigned
 * @return {void}
 */
App.prototype.setMapModel = function setMapModel(mapModel) {
   let children;
   let numChildren;
   let oldRootNode;

   // If there was a previous map, delete all nodes and views
   if (this._myMapModel !== null) {
      oldRootNode = this._myMapModel.getRootNode();
      children = oldRootNode.getChildren();
      numChildren = children.length;

      for (let i=0; i<numChildren; i++) {
         // Note: Can't use [i], because as we delete nodes, the "i" indexes
         //       will no longer be valid
         oldRootNode.deleteChild(children[0]);
      }
      oldRootNode.getView().deleteMyself();
   }

   this._myMapModel = mapModel;
}; // setMapModel()

/**
 * Create a new onfig because it doesn't exist yet (i.e. the user
 * has run a version prior to 0.7.0 before)
 *
 * @return {void}
 */
App.prototype._upgradeFrom0_0_0_To_0_7_0 =
   function _upgradeFrom0_0_0_To_0_7_0() {
   //--------------------------------------------------------------------
   // This corresponds to either first time user has run m3, or they
   // had previously run a version prior to 0.7.0
   //
   //    - Resave "m3-map1" in the m3 DB as an array of strings
   //    - Save our mapList (empty or the one above)
   //    - Save lastVersionRun
   //--------------------------------------------------------------------
   const MAP_LIST_EMPTY = "Map list should be empty"; // For promise return val
   const NEW_MAP1_KEY = `map-${Date.now()}`;
   const OLD_MAP1_KEY = "m3-map1";
   const OLD_MAP1_NAME = "Map 1";

   let promiseToWaitFor;

   localforage.getItem(OLD_MAP1_KEY).then(function resaveOldMap(map1Value) {
      if (map1Value !== null) {
         // Promise returns value that was set
         promiseToWaitFor = App.myDB.setItem(NEW_MAP1_KEY, [map1Value]);
      } else {
         promiseToWaitFor = Promise.resolve(null);
      }
      return promiseToWaitFor;

   }).then(function removeOldMap(map1Value){
      if (map1Value !== null) {
         // Promise returns undefined
         promiseToWaitFor = localforage.removeItem(OLD_MAP1_KEY);
      } else {
         promiseToWaitFor = Promise.resolve(MAP_LIST_EMPTY);
      }
      return promiseToWaitFor;

   }).then(function createMapList(promiseResult){
      let mapList = [];
      if (promiseResult !== MAP_LIST_EMPTY) {
         mapList.push({key: NEW_MAP1_KEY, name: OLD_MAP1_NAME});
      }
      return App.myDB.setItem(App.KEY_MAPLIST, mapList);

   }).then(function createLastVersionRun() {
      return App.myDB.setItem(App.KEY_LAST_VERSION_RUN, App.MY_VERSION);

   }).catch(function catchError(err) {
      let errorDialog = new ErrorDialog(
         `Error upgrading DB from previous version: ${err}`);
   });
};

/**
 * Do startup activities:
 *    - Check last version with current version and update storage as required
 *
 * @return {void}
 */
App.prototype._startup = function _startup() {
   // Must use either INDEXEDDB or WEBSQL, because localStorage may get
   // unexpectedly cleared by browser
   let dbConfig = {name: App.DB_NAME,
                   driver: [localforage.INDEXEDDB, localforage.WEBSQL]};
   App.myDB = localforage.createInstance(dbConfig);

   App.myDB.getItem(App.KEY_LAST_VERSION_RUN).then((lastVersionRun) => {
      if (lastVersionRun === null) {
         // This corresponds to user having run versions prior to 0.7.0,
         // or a first run
         this._upgradeFrom0_0_0_To_0_7_0();
      } else {
         // This corresponds to user having previously run version 0.7.0 or
         // greater
         return App.myDB.setItem(App.KEY_LAST_VERSION_RUN,
                                 this.getVersionAsString());
      }
   }).catch(function(err) {
      let errorDialog = new ErrorDialog("Error trying to save last run " +
                                        `version: ${err}`);
      // Error trying to get lastVersionRun
   });
}; // _startup()
