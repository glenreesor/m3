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
} // App()

App.DB_NAME = "m3 - Mobile Mind Mapper";
App.HTML_ID_PREFIX = 'm3-mobile-mind-mapper';
App.KEY_LAST_VERSION_RUN = "lastVersionRun";
App.KEY_MAPLIST = "mapList";
App.KEY_INVOCATION_COUNT = "invocationCount";

App.myDB = null;                          // This will be populated by _start()
App.MY_NAME = "m3 - Mobile Mind Mapper";
App.MY_VERSION = {major: 0,
                  minor: 11,
                  patch: 0,
                  isReleaseCandidate: false,
                  releaseCandidateNum: 1};

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
 * Get the full height of the app
 *
 * @return {string} - A CSS-compatible string that specifies the required
 *                    height of the app
 */
App.prototype.getHeight = function getHeight() {
   return this._embeddingOptions.height;
}; // getHeight()

/**
 * Get the name to be displayed for the initial map to load (null if none)
 *
 * @return {string} - The name of the map to load on startup
 */
App.prototype.getInitialMapName = function getInitialMapName() {
   return this._embeddingOptions.initialMapName;
}; // getInitialMapName()

/**
 * Get the URL of the initial map to load (null if none)
 *
 * @return {string} - A URL, either absolute or relative to index.html, whose
 *                    contents are a mind map to load on startup
 */
App.prototype.getInitialMapUrl = function getInitialMapUrl() {
   return this._embeddingOptions.initialMapUrl;
}; // getInitialMapUrl()

/**
 * Return the best type of localforage that is actually supported.
 * Use this because localforage.supports() isn't always truthful.
 * (In particular iOS Firefox and Chrome.)
 *
 * @return {Promise} - A promise that resolves to one of:
 *                        - localforage.INDEXEDDB
 *                        - localforage.WEBSQL
 *                        - localforage.LOCALSTORAGE
 */
App.prototype._getLocalForageDriver = function _getLocalForageDriver() {
   let dbConfig;
   let returnValue;
   let testDb;

   testDb = localforage.createInstance({name: 'storagetest'});

   // Try storage methods in the preferred order, returning first one that
   // doesn't generate an error.

   return new Promise(function (resolve, reject) {
      testDb.setDriver(localforage.INDEXEDDB);
      testDb.getItem('test').then( function(testvalue) {
         resolve(localforage.INDEXEDDB);
      }).catch( function(err) {
         testDb.setDriver(localforage.WEBSQL);
         testDb.getItem('test').then( function(testvalue) {
            resolve(localforage.WEBSQL);
         }).catch( function(err) {

            // We're going to assume that localstorage is available.
            resolve(localforage.LOCALSTORAGE);
         });
      });
   });
}; // _getLocalForageDriver()

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
   let version;
   version = `${App.MY_VERSION.major}.` +
             `${App.MY_VERSION.minor}.` +
             `${App.MY_VERSION.patch}`;

   if (App.MY_VERSION.isReleaseCandidate) {
      version += ` - Release Candidate ${App.MY_VERSION.releaseCandidateNum}`;
   }

   return version;
}; // getVersionAsString()

/**
 * Get the full width of the app
 *
 * @return {string} - A CSS-compatible string that specifies the required
 *                    width of the app
 */
App.prototype.getWidth = function getWidth() {
   return this._embeddingOptions.width;
}; // getWidth()

/**
 * Return whether embedding options say to be full page or not
 * @return {boolean} - Whether app should be full page or not
 */
App.prototype.isFullPage = function isFullPage() {
   return this._embeddingOptions.fullPage;
}; // isFullPage()

/**
 * Return whether embedding options say to be read only or not
 * @return {boolean} - Whether app should be read only
 */
App.prototype.isReadOnly = function isReadOnly() {
   return this._embeddingOptions.readOnly;
}; // isReadOnly()

/**
 * Get whether buttons should be shown
 *
 * @return {boolean} - Whether the buttons should be shown
 */
App.prototype.showButtons = function showButtons() {
   return this._embeddingOptions.showButtons;
}; // showButtons()

/**
 * Get whether map name should be shown
 *
 * @return {boolean} - Whether the map name should be shown
 */
App.prototype.showMapName = function showMapName() {
   return this._embeddingOptions.showMapName;
}; // showMapName()

/**
 * Run the app
 * @return {void}
 */
App.prototype.run = function run() {
   this._setEmbeddingOptions();
   this._sizer = new Sizer();

   if (this.isFullPage()) {
      //-----------------------------------------------------------------------
      // Set window title
      //-----------------------------------------------------------------------
      document.title = App.MY_NAME + " " + this.getVersionAsString();

      //-----------------------------------------------------------------------
      // Prompt user if they navigate away from this page or close the
      // tab/window
      //-----------------------------------------------------------------------
      window.addEventListener("beforeunload", function(event) {
         event.returnValue = "Are you sure you want to exit?";
         return event;
      });
   }

   this._controller = new Controller();
   this._startup();
}; // run()

/**
 * Set embedding options, overriding from js embedded in html as required
 *
 * @return {void}
 */
App.prototype._setEmbeddingOptions = function _setEmbeddingOptions() {
   const OPTION_INFO = {
      apiVersion: {
         type: 'string',
         default: '0.12'
      },

      fullPage: {
         type: 'boolean',
         default: true
      },

      height: {
         type: 'string',
         default: '100%'
      },

      initialMapName: {
         type: 'string',
         default: null
      },

      initialMapUrl: {
         type: 'string',
         default: null
      },

      readOnly: {
         type: 'boolean',
         default: false
      },

      showButtons: {
         type: 'boolean',
         default: true
      },

      showMapName: {
         type: 'boolean',
         default: true
      },

      width: {
         type: 'string',
         default: '100%'
      }
   };

   let option;
   let options;

   if (window.m3MobileMindMapper) {
      options = window.m3MobileMindMapper;

      //----------------------------------------------------------------------
      // Sanity checks since created by third-party
      //----------------------------------------------------------------------
      console.log('Validating window.m3MobileMindMapper...');

      for (option in OPTION_INFO) {
         if (
            options[option] !== undefined &&
            typeof(options[option]) !== OPTION_INFO[option].type
         ) {
            throw(`${option} must be of type ${OPTION_INFO[option].type}`);
         }
      }

      if (options.apiVersion !== '0.12') {
         throw('apiVersion must be 0.12');
      }

      if (
         options.height !== undefined &&
         !options.height.match(/[0-9]+(%|px)/)
      ) {
         throw('height must be a valid CSS length string');
      }

      if (
         options.width !== undefined &&
         !options.width.match(/[0-9]+(%|px)/)
      ) {
         throw('width must be a valid CSS length string');
      }

      console.log('window.m3MobileMindMapper is valid.');

      //----------------------------------------------------------------------
      // Override as required
      //----------------------------------------------------------------------
      this._embeddingOptions = {};

      for (option in OPTION_INFO) {
         this._embeddingOptions[option] =
            options[option] !== undefined ? options[option] :
                                            OPTION_INFO[option].default;
      }

   } else {
      this._embeddingOptions = {};

      for (option in OPTION_INFO) {
         this._embeddingOptions[option] = OPTION_INFO[option].default;
      }
   }
}; // _setEmbeddingOptions()

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
 * Create a new config because it doesn't exist yet (i.e. the user
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

   }).catch(function catchError(err) {
      let errorDialog = new ErrorDialog(
         `Error upgrading DB from previous version: ${err}`);
   });
}; // _upgradeFrom0_0_0_To_0_7_0()

/**
 * Ping our server with statistical info. This is intended to be run
 * only when m3 is upgraded to a new version.
 *
 * @param {string} oldVersion - The previous version the user had run, possibly
 *                              null
 * @param {integer} invocationCount - Number of times m3 has been run
 *
 * @return {void}
 */
App.prototype._sendStatsToServer = function _sendStatsToServer(
   oldVersion,
   invocationCount
) {
   let httpRequest;
   let statUrl;

   if (oldVersion === null) {
      oldVersion = '0';
   }

   httpRequest = new XMLHttpRequest();

   if (httpRequest) {
      // URL may or may not have index.html at the end
      statUrl = window.location.href.replace(/index\.html/, '');

      statUrl += `statLogger.php?oldVersion=${oldVersion}` +
                  `&currentVersion=${this.getVersionAsString()}` +
                  `&invocationCount=${invocationCount}` +
                  `&userAgent=${window.navigator.userAgent}`;

      // We're not looking for a response, but create a simple function
      // for debugging purposes.
      httpRequest.onreadystatechange = function() {
         let readyState = httpRequest.readyState;
      };
      httpRequest.open('POST', statUrl);
      httpRequest.send();
   }
}; // _sendStatsToServer()

/**
 * Do startup activities:
 *    - Notify user if they're running from m3-rc but it's not a release
 *      candidate
 *    - Update invocation count
 *    - Check last version with current version and update storage as required
 *    - Ping our server with some simple stats if the version was upgraded
 *
 * @return {void}
 */
App.prototype._startup = function _startup() {
   let currentOperation;     // For promise error msg (if required)
   let oldVersion;
   let newCount;             // Number of times m3 has been run

   // Tell user if they're running from /m3-rc but this isn't a release
   // candidate
   if (!App.MY_VERSION.isReleaseCandidate &&
       window.location.href.match(/\/m3-rc\/$/)
    ) {
      alert(`m3 version ${this.getVersionAsString()} has been released.` +
            ' Please switch to the regular non-release candidate location:' +
            ' http://glenreesor.ca/m3');
   }

   // localforage.supports(STORAGEMETHOD) sometimes reports true
   // even though the method isn't actually available, thus use brute
   // force tests to test for available storage types
   this._getLocalForageDriver().then( (driverName) => {
      let dbConfig;

      if (driverName === localforage.LOCALSTORAGE) {
         alert("Warning: Your browser does not support the longterm " +
               "reliable storage used by m3, therefore you shouldn't " +
               "rely on longterm storage of maps created in m3.");
      }

      dbConfig = {name: App.DB_NAME, driver: driverName};
      App.myDB = localforage.createInstance(dbConfig);

      //----------------------------------------------------------------------
      // Update invocation count
      // If user is on a new version:
      //    - Upgrade if required
      //    - Send stats to server
      //----------------------------------------------------------------------
      currentOperation = "updating invocation count";
      App.myDB.getItem(App.KEY_INVOCATION_COUNT).then( (oldCount) => {
         if (oldCount === null) {
            oldCount = 0;
         }

         newCount = oldCount + 1;
         return App.myDB.setItem(App.KEY_INVOCATION_COUNT, newCount);

      }).then( () => {
      currentOperation = "retrieving last version run";
         App.myDB.getItem(App.KEY_LAST_VERSION_RUN).then( (lastVersionRun) => {
            oldVersion = lastVersionRun;
            if (lastVersionRun === null) {
               // This corresponds to user having run versions prior to 0.7.0,
               // or a first run
               this._upgradeFrom0_0_0_To_0_7_0();
            }
            currentOperation = "setting last version run";
            return App.myDB.setItem(App.KEY_LAST_VERSION_RUN,
                                    this.getVersionAsString());
         }).then( () => {
            if (oldVersion !== this.getVersionAsString()) {

               // This should only be done for me or when debugging
               let url = window.location.href;
               if (
                  url.substr(0, 21) === 'http://glenreesor.ca/' ||
                  url.substr(0, 17) === 'http://127.0.0.1/'
               ) {
                  if (oldVersion !== null) {
                     alert("Congratulations! Your m3 has been updated to " +
                           `version ${this.getVersionAsString()}.`);
                  }
                  this._sendStatsToServer(oldVersion, newCount);
               }
            }
         });
      }).catch(function (err) {
         // Error trying to set invocation count
         let errorDialog = new ErrorDialog(`Error ${currentOperation}: ${err}`);
      });
   });
}; // _startup()
