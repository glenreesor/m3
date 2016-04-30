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
let testExportedXml = require('./helperFunctions').testExportedXml;

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
let Font = proxyquire('../../app/src/Font',
                      {
                         './Diagnostics': diagnosticsStub,
                         './main': mainStub
                      }).Font;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   bold: true,
   italic: true,
   size: "14"
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {Font} font - the Font to be tested
  * @return {void}
  */
function testAllAttributes(t, font) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 3,
      "all attributes listed in this file must be tested");

   t.equal(font.isBold(), allAttributes["bold"],
      "bold status must match value that was loaded");

   t.equal(font.isItalic(), allAttributes["italic"],
      "italic status must match value that was loaded");

   t.equal(font.getSize(), allAttributes["size"],
      "size must match value that was loaded");

} // testAllAttributes

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
// getAsXml - Exported XML same as source XML
//            This includes attributes and embedded tags that m3 doesn't
//            understand
//-----------------------------------------------------------------------------
test('Font - getAsXml()', function (t) {
   const UNKNOWN_ATTRIBUTE1 = 'unknownattribute1';
   const UNKNOWN_ATTRIBUTE2 = 'unknownattribute2';
   const UNKNOWN_TAG1 = "<unknownTag1 att1='value1'>" +
                        "<embeddedTag att2='value2'>a bunch of content" +
                        "</embeddedTag></unknownTag1>";
   const UNKNOWN_TAG2 = "<unknownTag2 att1='value1'>" +
                        "<embeddedTag att2='value2'>a bunch of content" +
                        "</embeddedTag></unknownTag2>";
   const UNKNOWN_VALUE1 = 'unknownvalue1';
   const UNKNOWN_VALUE2 = 'unknownvalue2';
   let origXml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   origXml = "<font ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;
   origXml += ">";
   origXml += `${UNKNOWN_TAG1}${UNKNOWN_TAG2}`;

   origXml += "</font>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new Font();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of Font gets logged
//-----------------------------------------------------------------------------
test('Font - loadFromXml1_0_1() - Creation of Font gets logged',
   function (t) {

   let font;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<font ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "></font>";

   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   font = new Font();
   logCount = 0;
   font.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of Font should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('Font - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let font;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<font ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += "></font>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   font = new Font();
   warningCount = 0;
   font.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, font);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('Font - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let docElement;
   let font;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<FONT ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += "></FONT>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   font = new Font();
   warningCount = 0;
   font.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, font);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('Font - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let docElement;
   let font;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Font
   //--------------------------------------------------------------------------
   xml = "<font ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "></font>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   font = new Font();

   warningCount = 0;
   font.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   testAllAttributes(t, font);
   t.end();
});
