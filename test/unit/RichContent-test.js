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
let testExportedXml = require('./helperFunctions').testExportedXml;

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

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let RichContent = proxyquire('../../app/src/RichContent',
                             {
                                './Diagnostics': diagnosticsStub,
                                './main': mainStub
                             }).RichContent;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   type: "note"
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {RichContent} richContent - the RichContent to be tested
  * @return {void}
  */
function testAllAttributes(t, richContent) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 1,
      "all attributes listed in this file must be tested");

   t.equal(richContent.getType(), allAttributes["type"],
      "type must match value that was loaded");
} // testAllAttributes

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
// getAsXml - Exported XML same as source XML
//            This includes attributes that m3 doesn't understand
//-----------------------------------------------------------------------------
test('RichContent - getAsXml()', function (t) {
   const UNKNOWN_ATTRIBUTE1 = 'unknownattribute1';
   const UNKNOWN_VALUE1 = 'unknownvalue1';
   const UNKNOWN_ATTRIBUTE2 = 'unknownattribute2';
   const UNKNOWN_VALUE2 = 'unknownvalue2';
   let origXml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   origXml = "<richcontent ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;

   origXml += "><html>content</html></richcontent>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new RichContent();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of RichContent gets logged
//-----------------------------------------------------------------------------
test('RichContent - loadFromXml1_0_1() - Creation of RichContent gets logged',
   function (t) {

   let richContent;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<richcontent ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "><html>content</html></richcontent>";

   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   richContent = new RichContent();
   logCount = 0;
   richContent.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of RichContent should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('RichContent - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let richContent;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the RichContent
   //--------------------------------------------------------------------------
   xml = "<richcontent ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += "><html>content</html></richcontent>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   richContent = new RichContent();
   warningCount = 0;
   richContent.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, richContent);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('RichContent - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let docElement;
   let richContent;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<RICHCONTENT ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += "><html>content</html></RICHCONTENT>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   richContent = new RichContent();
   warningCount = 0;
   richContent.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, richContent);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('RichContent - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let docElement;
   let richContent;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<richcontent ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "><html>content</html></richcontent>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   richContent = new RichContent();

   warningCount = 0;
   richContent.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   testAllAttributes(t, richContent);
   t.end();
});
