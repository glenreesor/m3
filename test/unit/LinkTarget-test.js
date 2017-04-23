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
let logCount;                 // Number of times diagnosticsStub.log() called
let mainStub;
let mapModel;
let warningCount;             // Number of times diagnosticsStub.warn() called

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
let LinkTarget = proxyquire('../../app/src/LinkTarget',
                            {
                               './Diagnostics': diagnosticsStub,
                               './main': mainStub,
                               './xmlHelpers': xmlHelpersStub
                            }).LinkTarget;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTE_DEFAULTS = new Map([["COLOR", "#000000"],
                                    ["DESTINATION", ""],
                                    ["ENDARROW", ""],
                                    ["ENDINCLINATION", ""],
                                    ["ID", ""],
                                    ["SOURCE", ""],
                                    ["STARTARROW", ""],
                                    ["STARTINCLINATION", ""]]);
const ATTRIBUTES = new Map([["COLOR", "#123456"],
                            ["DESTINATION", "ID_123456"],
                            ["ENDARROW", "none"],
                            ["ENDINCLINATION", "150;5;"],
                            ["ID", "ID_654321"],
                            ["SOURCE", "ID_11223344"],
                            ["STARTARROW", "none"],
                            ["STARTINCLINATION", "160;6;"]
]);
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('LinkTarget - Constructor', function (t) {
   let linkTarget;

   linkTarget = new LinkTarget();

   t.equal(linkTarget.getColor(), null,
      "Default color should be null");

   t.equal(linkTarget.getDestination(), null,
      "Default destination should be null");

   t.equal(linkTarget.getEndArrow(), null,
      "Default endArrow should be null");

   t.equal(linkTarget.getEndInclination(), null,
      "Default endInclination should be null");

   t.equal(linkTarget.getId(), null,
      "Default id should be null");

   t.equal(linkTarget.getSource(), null,
      "Default source should be null");

   t.equal(linkTarget.getStartArrow(), null,
      "Default startArrow should be null");

   t.equal(linkTarget.getStartInclination(), null,
      "Default startInclination should be null");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('LinkTarget - set/get Color()', function (t) {
   const newColor = "#111111";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setColor(newColor);

   t.equal(linkTarget.getColor(), newColor,
      "getColor() should return the new color");

   t.end();
});

test('LinkTarget - set/get Destination()', function (t) {
   const newDestination = "ID_123456";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setDestination(newDestination);

   t.equal(linkTarget.getDestination(), newDestination,
      "getDestination should return the new destination");

   t.end();
});

test('LinkTarget - set/get EndArrow()', function (t) {
   const newEndArrow = "None";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setEndArrow(newEndArrow);

   t.equal(linkTarget.getEndArrow(), newEndArrow,
      "getEndArrow() should return the new endArrow");

   t.end();
});

test('LinkTarget - set/get EndInclination()', function (t) {
   const newEndInclination = "193;3;";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setEndInclination(newEndInclination);

   t.equal(linkTarget.getEndInclination(), newEndInclination,
      "getEndInclination() should return the new endInclination");

   t.end();
});

test('LinkTarget - set/get Id()', function (t) {
   const newId = "ID_123456";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setId(newId);

   t.equal(linkTarget.getId(), newId,
      "getId() should return the new id");

   t.end();
});

test('LinkTarget - set/get Source()', function (t) {
   const newSource = "ID_123456";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setSource(newSource);

   t.equal(linkTarget.getSource(), newSource,
      "getSource() should return the new source");

   t.end();
});

test('LinkTarget - set/get StartArrow()', function (t) {
   const newStartArrow = "None";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setStartArrow(newStartArrow);

   t.equal(linkTarget.getStartArrow(), newStartArrow,
      "getStartArrow() should return the new startArrow");

   t.end();
});

test('LinkTarget - set/get StartInclination()', function (t) {
   const newStartInclination = "193;3;";
   let linkTarget;

   linkTarget = new LinkTarget();
   linkTarget.setStartInclination(newStartInclination);

   t.equal(linkTarget.getStartInclination(), newStartInclination,
      "getStartInclination() should return the new startInclination");

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
test('LinkTarget - loadFromXml, getAsXml', function (t) {
   let linkTarget;
   let xml;

   linkTarget = new LinkTarget();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   linkTarget.loadFromXml1_0_1();

   // First test is to make sure when attributes are added to this file,
   // we actually test them
   t.equal(ATTRIBUTES.size, 8,
      "all attributes listed in this file must be tested");

   t.equal(linkTarget.getColor(), ATTRIBUTES.get("COLOR"),
      "color must match value that was loaded");

   t.equal(linkTarget.getDestination(), ATTRIBUTES.get("DESTINATION"),
      "destination must match value that was loaded");

   t.equal(linkTarget.getEndArrow(), ATTRIBUTES.get("ENDARROW"),
      "endArrow must match value that was loaded");

   t.equal(linkTarget.getEndInclination(), ATTRIBUTES.get("ENDINCLINATION"),
      "endInclination must match value that was loaded");

   t.equal(linkTarget.getId(), ATTRIBUTES.get("ID"),
      "id must match value that was loaded");

   t.equal(linkTarget.getSource(), ATTRIBUTES.get("SOURCE"),
      "source must match value that was loaded");

   t.equal(linkTarget.getStartArrow(), ATTRIBUTES.get("STARTARROW"),
      "startArrow must match value that was loaded");

   t.equal(linkTarget.getStartInclination(), ATTRIBUTES.get("STARTINCLINATION"),
      "startInclination must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = linkTarget.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "linktarget",
      "tagname must be passed properly");

   validateCreateXmlArgs(t, xmlHelpersStub.createXml, ATTRIBUTE_DEFAULTS,
                         ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                         [], UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
