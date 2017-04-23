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

let test = require('tape');
let proxyquire = require('proxyquire');

let DOMParser = require('xmldom').DOMParser;
let validateCreateXmlArgs = require('./helperFunctions').validateCreateXmlArgs;

let xmlHelpersStub = {};
xmlHelpersStub.createXml = require('./helperFunctions').createXml;

//-----------------------------------------------------------------------------
// Create proxyquire stubs
//-----------------------------------------------------------------------------
let diagnosticsStub;
let getNodeModelByIdCount;    // Number of times called
let logCount;                 // Number of times diagnosticsStub.log() called
let mainStub;
let warningCount;             // Number of times diagnosticsStub.warn() called

getNodeModelByIdCount = 0;
logCount = 0;
warningCount = 0;

diagnosticsStub = {};
diagnosticsStub.Diagnostics = function Diagnostics(){};
diagnosticsStub.Diagnostics.TASK_IMPORT_XML = "Task Import Xml";
diagnosticsStub.Diagnostics.log = function() {
   logCount += 1;
};

diagnosticsStub.Diagnostics.warn = function() {
   warningCount += 1;
};

mainStub = {};
mainStub.m3App = {};
mainStub.m3App.getDiagnostics = function getDiagnostics() {
   return diagnosticsStub.Diagnostics;
};

// What's important is what's returned. Don't care what was passed in.
xmlHelpersStub.loadXml = function(xmlElement, attributeDefaults,
                                  expectedTags) {
   return [
      ATTRIBUTES,
      UNEXPECTED_ATTRIBUTES,
      [],
      UNEXPECTED_TAGS
   ];
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let ArrowLink = proxyquire('../../app/src/ArrowLink',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub,
                              './xmlHelpers': xmlHelpersStub
                           }).ArrowLink;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTE_DEFAULTS = new Map([["COLOR", "#000000"],
                                    ["DESTINATION", ""],
                                    ["ENDARROW", ""],
                                    ["ENDINCLINATION", ""],
                                    ["ID", ""],
                                    ["STARTARROW", ""],
                                    ["STARTINCLINATION", ""]
                                   ]);

const ATTRIBUTES = new Map([["COLOR", "#123456"],
                            ["DESTINATION", "ID_123456"],
                            ["ENDARROW", "none"],
                            ["ENDINCLINATION", "155;0"],
                            ["ID", "ID_654321"],
                            ["STARTARROW", "none"],
                            ["STARTINCLINATION", "150;0"]
                           ]);
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
// Create local stubs
//-----------------------------------------------------------------------------
function MapModelStub() {
}

MapModelStub.prototype.getNodeModelById = function getNodeModelById() {
   getNodeModelByIdCount += 1;
};

MapModelStub.prototype.getRoot = function getRoot() {
   return "123456";
};

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('ArrowLink - Constructor', function (t) {
   let arrowLink;
   let xml;

   arrowLink = new ArrowLink();

   //-------------------------------------------------------------------------
   // Defaults
   //-------------------------------------------------------------------------
   t.equal(arrowLink.getColor(), "#000000",
      "Default color should be '#000000'");

   t.equal(arrowLink.getDestinationId(), null,
      "Default destinationId should be null");

   t.equal(arrowLink.getDestinationNode(), null,
      "Default destinationNode should be null");

   t.equal(arrowLink.getEndArrow(), null,
      "Default endArrow should be null");

   t.equal(arrowLink.getEndInclination(), null,
      "Default endInclination should be null");

   t.equal(arrowLink.getId(), null,
      "Default Id should be null");

   t.equal(arrowLink.getStartArrow(), null,
      "Default startArrow should be null");

   t.equal(arrowLink.getStartInclination(), null,
      "Default startInclination should be null");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('ArrowLink - set/get Color()', function (t) {
   const newColor = "#111111";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setColor(newColor);

   t.equal(arrowLink.getColor(), newColor,
      "getColor() should return the new color");

   t.end();
});

test('ArrowLink - set/get DestinationId()', function (t) {
   const newDestinationId = "ID_123456";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setDestinationId(newDestinationId);

   t.equal(arrowLink.getDestinationId(), newDestinationId,
      "getDestinationId() should return the new destinationId");

   t.end();
});

test('ArrowLink - set/get EndArrow()', function (t) {
   const newEndArrow = "None";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setEndArrow(newEndArrow);

   t.equal(arrowLink.getEndArrow(), newEndArrow,
      "getEndArrow() should return the new endArrow");
   t.end();
});

test('ArrowLink - set/get EndInclination()', function (t) {
   const newEndInclination = "163;0;";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setEndInclination(newEndInclination);

   t.equal(arrowLink.getEndInclination(), newEndInclination,
      "getEndInclination() should return the new endInclination");

   t.end();
});

test('ArrowLink - set/get Id()', function (t) {
   const newId = "ID_123456";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setId(newId);

   t.equal(arrowLink.getId(), newId,
      "getId() should return the new Id");

   t.end();
});

test('ArrowLink - set/get StartArrow()', function (t) {
   const newStartArrow = "None";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setStartArrow(newStartArrow);

   t.equal(arrowLink.getStartArrow(), newStartArrow,
      "getStartArrow() should return the new startArrow");

   t.end();
});

test('ArrowLink - set/get StartInclination()', function (t) {
   const newStartInclination = "163;0;";
   let arrowLink;

   arrowLink = new ArrowLink();
   arrowLink.setStartInclination(newStartInclination);

   t.equal(arrowLink.getStartInclination(), newStartInclination,
      "getStartInclination() should return the new startInclination");

   t.end();
});

//-----------------------------------------------------------------------------
// connectToNodeModel - Calls mapModel.getNodeModelById
//-----------------------------------------------------------------------------
test('ArrowLink - connectToNodeModel()', function (t) {
   let arrowLink;

   getNodeModelByIdCount = 0;

   arrowLink = new ArrowLink();
   arrowLink.connectToNodeModel(new MapModelStub);

   t.equal(getNodeModelByIdCount, 1,
      "getNodeModelById() should be called once");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml - Values are loaded properly
//             - Embedded objects (if any) are constructed
//
// getAsXml    - All regular attributes are passed to helper
//             - All unexpected attributes are passed to helper
//             - All unexpected tags, and their contents, are in the output
//-----------------------------------------------------------------------------
test('ArrowLink - loadFromXml, getAsXml', function (t) {
   let arrowLink;
   let xml;

   arrowLink = new ArrowLink();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   arrowLink.loadFromXml1_0_1();

   // First test is to make sure when attributes are added to this file,
   // we actually test them
   t.equal(ATTRIBUTES.size, 7,
      "all attributes listed in this file must be tested");

   t.equal(arrowLink.getColor(), ATTRIBUTES.get("COLOR"),
      "color must match value that was loaded");

   t.equal(arrowLink.getDestinationId(), ATTRIBUTES.get("DESTINATION"),
      "destination must match value that was loaded");

   t.equal(arrowLink.getEndArrow(), ATTRIBUTES.get("ENDARROW"),
      "endArrow must match value that was loaded");

   t.equal(arrowLink.getEndInclination(), ATTRIBUTES.get("ENDINCLINATION"),
      "endInclination must match value that was loaded");

   t.equal(arrowLink.getId(), ATTRIBUTES.get("ID"),
      "id must match value that was loaded");

   t.equal(arrowLink.getStartArrow(), ATTRIBUTES.get("STARTARROW"),
      "startArrow must match value that was loaded");

   t.equal(arrowLink.getStartInclination(), ATTRIBUTES.get("STARTINCLINATION"),
      "startInclination must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = arrowLink.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "arrowlink",
      "tagname must be passed properly");

   validateCreateXmlArgs(t, xmlHelpersStub.createXml, ATTRIBUTE_DEFAULTS,
                         ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                         [], UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
