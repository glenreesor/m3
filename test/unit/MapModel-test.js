"use strict";

// Copyright 2016 Glen Reesor
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

let test = require('tape');
let proxyquire = require('proxyquire');

global.DOMParser = require('xmldom').DOMParser;

let testExportedAttributesAndTags =
   require('./helperFunctions').testExportedAttributesAndTags;

let xmlHelpersStub = {};
xmlHelpersStub.createXml = require('./helperFunctions').createXml;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let appStub;
let controllerStub;
let diagnosticsStub;
let diagnosticsErrCount;   // Number of times called
let diagnosticsLogCount;   // Number of times called
let diagnosticsWarnCount;  // Number of times called
let dbSetItemCount;        // Number of times called
let errorDialogCount;      // Number of times called
let errorDialogStub;
let mainStub;
let nodeModelStub;
let saveDialogConstructorCount;  // Number of times called
let saveDialogStub;

//-----------------------------------------------------------------------------
// Create proxyquire stubs
//-----------------------------------------------------------------------------
appStub = {};
appStub.App = function App() { };
appStub.App.myDB = {};
appStub.App.myDB.setItem = function setItem(dbKey, xml) {
   dbSetItemCount += 1;
   return Promise.resolve(true);
};

diagnosticsStub = {};
diagnosticsStub.Diagnostics = function Diagnostics(){};
diagnosticsStub.Diagnostics.TASK_IMPORT_XML = "Task Import Xml";
diagnosticsStub.Diagnostics.err = function() {
   diagnosticsErrCount += 1;
};

diagnosticsStub.Diagnostics.log = function() {
   diagnosticsLogCount += 1;
};

diagnosticsStub.Diagnostics.warn = function() {
   diagnosticsWarnCount += 1;
};

errorDialogStub = {};
errorDialogStub.ErrorDialog = function ErrorDialog(msg) {
   errorDialogCount += 1;
};

mainStub = {};
mainStub.m3App = {};
mainStub.m3App.getDiagnostics = function getDiagnostics() {
   return diagnosticsStub.Diagnostics;
};

nodeModelStub = {};
nodeModelStub.NodeModel = function NodeModel(controller, myMapModel, newType,
                                             parent, text, parsedXml) {
   let childNode;

   // Store the parent node, so getId() stub has some criteria to use
   // for returning different IDs
   this._parent = parent;

   // If the parent is null, create a child for getChildren() to return
   // Note: If we don't restrict this to root node, we'll end up with infinite
   //       recursion :-)
   this._children = [];

   if (this._parent === null) {
      // Need non-null child so getId() can return different IDs
      childNode = new nodeModelStub.NodeModel(null, null, null, this, null,
                                              null);
      this._children.push(childNode);
   }
};

nodeModelStub.NodeModel.prototype.connectArrowLinks =
   function connectArrowLinks() {};

nodeModelStub.NodeModel.prototype.getAsXml = function getAsXml() {
   return "<node/>";
};

nodeModelStub.NodeModel.prototype.getChildren = function getChildren() {
   return this._children;
};

nodeModelStub.NodeModel.prototype.getId = function getId() {
   let returnVal;

   // We need to return different IDs so testing of getNodeModelById can be
   // fully tested
   if (this._parent === null) {
      returnVal = "root";
   } else {
      returnVal = "nonroot";
   }
   return returnVal;
};

saveDialogStub = {};
saveDialogStub.SaveDialog = function SaveDialog() {
   saveDialogConstructorCount += 1;
};

// What's important is what's returned. Don't care what was passed in.
xmlHelpersStub.loadXml = function(xmlElement, attributeDefaults,
                                  expectedTags) {
   let parser;
   let parsedEmbeddedTags = [];

   parser = new DOMParser();

   EMBEDDED_TAGS.forEach(function(t) {
      parsedEmbeddedTags.push(parser.parseFromString(t, "text/xml").
         documentElement);
   });

   return [
      ATTRIBUTES,
      UNEXPECTED_ATTRIBUTES,
      parsedEmbeddedTags,
      UNEXPECTED_TAGS
   ];
};

//-----------------------------------------------------------------------------
// Create local stubs
//-----------------------------------------------------------------------------
controllerStub = {};
controllerStub.setMapName = function setMapName() {};
controllerStub.setModifiedIndicator = function setModifiedIndicator() {};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let MapModel = proxyquire('../../app/src/MapModel',
                           {
                              './App': appStub,
                              './Diagnostics': diagnosticsStub,
                              './ErrorDialog': errorDialogStub,
                              './main': mainStub,
                              './NodeModel': nodeModelStub,
                              './SaveDialog': saveDialogStub,
                              './xmlHelpers': xmlHelpersStub
                           }).MapModel;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTES = new Map([["version", "55.0.1"]]);
const EMBEDDED_TAGS = ['<node/>'];
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('MapModel - Constructor - Defaults', function (t) {
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);

   t.equal(mapModel.getDbKey(), null,
           "Default dbKey should be null");

   t.notEqual(mapModel.getRoot(), null,
              "Default map should have a root node");

   t.equal(mapModel.getModifiedStatus(), true,
           "Default map has a true modified status");

   t.end();
});

//-----------------------------------------------------------------------------
// Constructor from XML - Values are loaded properly
//                      - Embedded objects (if any) are constructed
//
// getAsXml    - All regular attributes are passed to helper
//             - All unexpected attributes are passed to helper
//             - All unexpected tags, and their contents, are in the output
//-----------------------------------------------------------------------------
test('MapModel - constructor from XML, getAsXml', function (t) {
   let mapModel;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xml = "<map ";
   for (let a of ATTRIBUTES) {
      xml += `${a[0]}="${a[1]}" `;
   }

   for (let a of UNEXPECTED_ATTRIBUTES) {
      xml += `${a[0]}="${a[1]}" `;
   }
   xml += ">";

   EMBEDDED_TAGS.forEach(function (t) {
      xml += t;
   });

   UNEXPECTED_TAGS.forEach(function (t) {
      xml += t;
   });

   xml += "</map>";

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   mapModel = new MapModel(controllerStub, MapModel.TYPE_XML, null,
                           "test map", [xml]);

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(ATTRIBUTES.size, 1,
      "all attributes listed in this file must be tested");

   t.equal(mapModel.getVersion(), ATTRIBUTES.get("version"),
      "version must match value that was loaded");

   //--------------------------------------------------------------------------
   // Embedded Tags
   //--------------------------------------------------------------------------
   t.notEqual(mapModel.getRoot(), null,
      "there must be a NodeModel present");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = mapModel.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "map",
      "tagname must be passed properly");

   testExportedAttributesAndTags(t, xmlHelpersStub.createXml, ATTRIBUTES,
                         UNEXPECTED_ATTRIBUTES, "version", "",
                         EMBEDDED_TAGS, UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('MapModel - set/get DbKey()', function (t) {
   const newKey = "newkey";
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);

   mapModel.setDbKey(newKey);

   t.equal(mapModel.getDbKey(), newKey,
      "getDbKey() should reflect the new dbKey");

   t.end();
});

test('MapModel - set/get MapName()', function (t) {
   const newMapName = "newmapname";
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);

   mapModel.setMapName(newMapName);

   t.equal(mapModel.getMapName(), newMapName,
      "getMapName() should reflect the new mapName");

   t.end();
});

test('MapModel - set/get ModifiedStatus()', function (t) {
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);

   mapModel.setModifiedStatus(false);

   t.equal(mapModel.getModifiedStatus(), false,
      "getModifiedStatus() should reflect the new status");

   mapModel.setModifiedStatus(true);

   t.equal(mapModel.getModifiedStatus(), true,
      "getModifiedStatus() should reflect the new status");

   t.end();
});

//-----------------------------------------------------------------------------
// getNodeModelById
//-----------------------------------------------------------------------------
test("MapModel - getNodeModelById()", function(t) {
   let mapModel;
   let nonRootNode;
   let rootNode;

   //-------------------------------------------------------------------------
   // Create a simple map
   //-------------------------------------------------------------------------
   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);

   //-------------------------------------------------------------------------
   // Test finding root node and non-root node
   //-------------------------------------------------------------------------
   rootNode = mapModel.getRoot();
   nonRootNode = rootNode.getChildren()[0];

   t.equal(mapModel.getNodeModelById(rootNode, "root"), rootNode,
           "getNodeModelById() should return the root node");

   t.equal(mapModel.getNodeModelById(rootNode, "nonroot"), nonRootNode,
           "getNodeModelById() should return the non-root node");

   t.end();
});

//-----------------------------------------------------------------------------
// getRoot
//-----------------------------------------------------------------------------
test("MapModel - getRoot()", function(t) {
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);
   //-------------------------------------------------------------------------
   // Since NodeModel is stubbed, we're just testing that getRoot() returns
   // something non-null.
   //-------------------------------------------------------------------------
   t.notEqual(mapModel.getRoot(), null,
              "mapModel must have a root node");

   t.end();
});

//-----------------------------------------------------------------------------
// getVersion
//-----------------------------------------------------------------------------
test("MapModel - getVersion()", function(t) {
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);
   //-------------------------------------------------------------------------
   t.equal(mapModel.getVersion(), MapModel._DEFAULT_VERSION,
              "mapModel must have default version set");

   t.end();
});

//-----------------------------------------------------------------------------
// save
//-----------------------------------------------------------------------------
test("MapModel - save()", function(t) {
   let mapModel;

   mapModel = new MapModel(controllerStub, MapModel.TYPE_EMPTY, null,
                           "test map", null);
   //-------------------------------------------------------------------------
   // Save a map that hasn't been saved before
   //-------------------------------------------------------------------------
   saveDialogConstructorCount = 0;
   mapModel.save();

   t.equal(saveDialogConstructorCount, 1,
           "save dialog should be constructed on new map save");

   //-------------------------------------------------------------------------
   // Save a map that already has a dbkey
   //-------------------------------------------------------------------------
   saveDialogConstructorCount = 0;
   dbSetItemCount = 0;

   mapModel.setDbKey("12345");

   mapModel.save();

   t.equal(saveDialogConstructorCount, 0,
           "MapModel with a dbKey shouldn't call save dialog");

   t.equal(dbSetItemCount, 1,
           "MapModel with a dbKey should be saved to db");

   // It would be nice if we could test the return value from
   // getModifiedStatus(), but the status isn't changed until after
   // a Promise is resolved, thus not in this execution chain

   t.end();
});
