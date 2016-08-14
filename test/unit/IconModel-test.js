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
let IconModel = proxyquire('../../app/src/IconModel',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub,
                              './xmlHelpers': xmlHelpersStub
                           }).IconModel;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTE_DEFAULTS = new Map([['BUILTIN', 'm3']]);
const ATTRIBUTES = new Map([['BUILTIN', 'idea']]);
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('IconModel - Constructor', function (t) {
   let iconModel;

   iconModel = new IconModel();

   t.equal(iconModel.getName(), 'm3',
      "default name should be 'm3'");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('IconModel - set/get Name()', function (t) {
   const newName = 'testName';
   let iconModel;

   iconModel = new IconModel();
   iconModel.setName(newName);

   t.equal(iconModel.getName(), newName,
      "getName() should return the new name");

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
test('IconModel - loadFromXml, getAsXml', function (t) {
   let iconModel;
   let xml;

   iconModel = new IconModel();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   iconModel.loadFromXml1_0_1();

   // First test is to make sure when attributes are added to this file,
   // we actually test them
   t.equal(ATTRIBUTES.size, 1,
      "all attributes listed in this file must be tested");

   t.equal(iconModel.getName(), ATTRIBUTES.get("BUILTIN"),
      "name must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = iconModel.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "icon",
      "tagname must be passed properly");

   validateCreateXmlArgs(t, xmlHelpersStub.createXml, ATTRIBUTE_DEFAULTS,
                         ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                         [], UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
