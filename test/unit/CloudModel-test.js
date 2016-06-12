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

let test = require('tape');
let proxyquire = require('proxyquire');

let DOMParser = require('xmldom').DOMParser;
let testExportedAttributesAndTags =
   require('./helperFunctions').testExportedAttributesAndTags;

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
let CloudModel = proxyquire('../../app/src/CloudModel',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub,
                              './xmlHelpers': xmlHelpersStub
                           }).CloudModel;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTES = new Map([["COLOR", "#123456"]]);
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('CloudModel - Constructor', function (t) {
   let cloudModel;

   cloudModel = new CloudModel();

   t.equal(cloudModel.getColor(), "#cccccc",
      "default color should be '#cccccc'");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('CloudModel - set/get Color()', function (t) {
   const newColor = "#111111";
   let cloudModel;

   cloudModel = new CloudModel();
   cloudModel.setColor(newColor);

   t.equal(cloudModel.getColor(), newColor,
      "getColor() should return the new color");

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
test('CloudModel - loadFromXml, getAsXml', function (t) {
   let cloudModel;
   let xml;

   cloudModel = new CloudModel();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   cloudModel.loadFromXml1_0_1();

   // First test is to make sure when attributes are added to this file,
   // we actually test them
   t.equal(ATTRIBUTES.size, 1,
      "all attributes listed in this file must be tested");

   t.equal(cloudModel.getColor(), ATTRIBUTES.get("COLOR"),
      "color must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = cloudModel.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "cloud",
      "tagname must be passed properly");

   testExportedAttributesAndTags(t, xmlHelpersStub.createXml, ATTRIBUTES,
                         UNEXPECTED_ATTRIBUTES, "COLOR", "#cccccc",
                         [], UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
