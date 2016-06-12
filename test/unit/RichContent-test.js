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
let testExportedAttributesAndTags =
   require('./helperFunctions').testExportedAttributesAndTags;

let xmlHelpersStub = {};
xmlHelpersStub.createXml = require('./helperFunctions').createXml;

global.XMLSerializer = require('xmldom').XMLSerializer;

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

   let parser;
   let parsedEmbeddedTags = [];

   parser = new DOMParser();

   EMBEDDED_TAGS.forEach(function (t) {
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
//-----------------------------------------------------------------------------
let RichContent = proxyquire('../../app/src/RichContent',
                             {
                                './Diagnostics': diagnosticsStub,
                                './main': mainStub,
                                './xmlHelpers': xmlHelpersStub
                             }).RichContent;

//-----------------------------------------------------------------------------
// Various constants
//-----------------------------------------------------------------------------
const ATTRIBUTES = new Map([["TYPE", "note"]]);
const EMBEDDED_TAGS = ["<html/>"];
const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('RichContent - Constructor', function (t) {
   let richContent;

   richContent = new RichContent();

   t.equal(richContent.getType(), null,
      "Default type should be null");

   t.equal(richContent.getContent(), null,
      "Default content should be null");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('RichContent - set/get Type()', function (t) {
   let richContent;

   richContent = new RichContent();

   richContent.setType("node");
   t.equal(richContent.getType(), "node",
      "getType() should reflect setType()");

   t.end();
});

test('RichContent - set/get Content()', function (t) {
   let richContent;

   richContent = new RichContent();

   richContent.setContent("test content");
   t.equal(richContent.getContent(), "test content",
      "getContent() should reflect setContent()");

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
test('RichContent - loadFromXml, getAsXml', function (t) {
   let richContent;
   let xml;

   richContent = new RichContent();

   //-------------------------------------------------------------------------
   // First test loading
   //-------------------------------------------------------------------------
   // Doesn't matter what we pass it, because the stubs ignore it anyway
   richContent.loadFromXml1_0_1();

   //-------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //-------------------------------------------------------------------------
   t.equal(ATTRIBUTES.size, 1,
      "all attributes listed in this file must be tested");

   t.equal(richContent.getType(), ATTRIBUTES.get("TYPE"),
      "type must match value that was loaded");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = richContent.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "richcontent",
      "tagname must be passed properly");

   testExportedAttributesAndTags(t, xmlHelpersStub.createXml, ATTRIBUTES,
                         UNEXPECTED_ATTRIBUTES, "TYPE", "",
                         EMBEDDED_TAGS, UNEXPECTED_TAGS);

   //-------------------------------------------------------------------------

   t.end();
});
