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
let Font = proxyquire('../../app/src/Font',
                      {
                         './Diagnostics': diagnosticsStub,
                         './main': mainStub,
                         './xmlHelpers': xmlHelpersStub
                      }).Font;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTE_DEFAULTS = new Map([["BOLD", "false"],
                                    ["ITALIC", "size"],
                                    ["SIZE", "12"]]);
const ATTRIBUTES = new Map([["BOLD", "true"],
                            ["ITALIC", "true"],
                            ["SIZE", "14"]]);
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('Font - Constructor', function (t) {
   let font;

   font = new Font();

   t.equal(font.getSize(), "12",
      "Default size should be 12");

   t.equal(font.isBold(), false,
      "Default bold status should be false");

   t.equal(font.isItalic(), false,
      "Default italic status should be false");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('Font - set/get Bold()', function (t) {
   let font;

   font = new Font();

   font.setBold(true);
   t.equal(font.isBold(), true,
      "isBold() should reflect setBold()");

   font.setBold(false);
   t.equal(font.isBold(), false,
      "isBold() should reflect setBold()");

   t.end();
});

test('Font - set/get Italic()', function (t) {
   let font;

   font = new Font();

   font.setItalic(true);
   t.equal(font.isItalic(), true,
      "isItalic() should reflect setItalic()");

   font.setItalic(false);
   t.equal(font.isItalic(), false,
      "isItalic() should reflect setItalic()");

   t.end();
});

test('Font - set/get Size()', function (t) {
   const newSize = "42";
   let font;

   font = new Font();

   font.setSize(newSize);
   t.equal(font.getSize(), newSize,
      "getSize() should return the new size");

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
test('Font - loadFromXml, getAsXml', function (t) {
   let font;
   let xml;

   font = new Font();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   font.loadFromXml1_0_1();

   // First test is to make sure when attributes are added to this file,
   // we actually test them
   t.equal(ATTRIBUTES.size, 3,
      "all attributes listed in this file must be tested");

   t.equal(new Boolean(font.isBold()).toString(), ATTRIBUTES.get("BOLD"),
      "bold status must match value that was loaded");

   t.equal(new Boolean(font.isItalic()).toString(), ATTRIBUTES.get("ITALIC"),
      "italic status must match value that was loaded");

   t.equal(font.getSize(), ATTRIBUTES.get("SIZE"),
      "size must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = font.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "font",
      "tagname must be passed properly");

   validateCreateXmlArgs(t, xmlHelpersStub.createXml, ATTRIBUTE_DEFAULTS,
                         ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                         [], UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
