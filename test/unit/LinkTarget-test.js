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
let LinkTarget = proxyquire('../../app/src/LinkTarget',
                            {
                               './Diagnostics': diagnosticsStub,
                               './main': mainStub
                            }).LinkTarget;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   color: "#123456",
   destination: "ID_123456",
   endarrow: "none",
   endinclination: "150;5;",
   id: "ID_654321",
   source: "ID_11223344",
   startarrow: "none",
   startinclination: "160;6;"
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {LinkTarget} linkTarget - the LinkTarget to be tested
  * @return {void}
  */
function testAllAttributes(t, linkTarget) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 8,
      "all attributes listed in this file must be tested");

   t.equal(linkTarget.getColor(), allAttributes["color"],
      "color must match value that was loaded");

   t.equal(linkTarget.getDestination(), allAttributes["destination"],
      "destination must match value that was loaded");

   t.equal(linkTarget.getEndArrow(), allAttributes["endarrow"],
      "endArrow must match value that was loaded");

   t.equal(linkTarget.getEndInclination(), allAttributes["endinclination"],
      "endInclination must match value that was loaded");

   t.equal(linkTarget.getId(), allAttributes["id"],
      "id must match value that was loaded");

   t.equal(linkTarget.getSource(), allAttributes["source"],
      "source must match value that was loaded");

   t.equal(linkTarget.getStartArrow(), allAttributes["startarrow"],
      "startArrow must match value that was loaded");

   t.equal(linkTarget.getStartInclination(), allAttributes["startinclination"],
      "startInclination must match value that was loaded");

} // testAllAttributes

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
// getAsXml - Exported XML same as source XML
//            This includes attributes and embedded tags that m3 doesn't
//            understand
//-----------------------------------------------------------------------------
test('LinkTarget - getAsXml()', function (t) {
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
   // Setup XML to load the LinkTarget
   //--------------------------------------------------------------------------
   origXml = "<linktarget ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;
   origXml += ">";
   origXml += `${UNKNOWN_TAG1}${UNKNOWN_TAG2}`;

   origXml += "</linktarget>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new LinkTarget();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of LinkTarget gets logged
//-----------------------------------------------------------------------------
test('LinkTarget - loadFromXml1_0_1() - Creation of LinkTarget gets logged',
   function (t) {

   let docElement;
   let linkTarget;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the LinkTarget
   //--------------------------------------------------------------------------
   xml = "<linktarget ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "></linktarget>";

   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   linkTarget = new LinkTarget();
   logCount = 0;
   linkTarget.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of LinkTarget should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('LinkTarget - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let docElement;
   let linkTarget;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the LinkTarget
   //--------------------------------------------------------------------------
   xml = "<linktarget ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += "></linktarget>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   linkTarget = new LinkTarget();
   warningCount = 0;
   linkTarget.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, linkTarget);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('LinkTarget - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let docElement;
   let linkTarget;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the LinkTarget
   //--------------------------------------------------------------------------
   xml = "<LINKTARGET ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += "></LINKTARGET>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   linkTarget = new LinkTarget();
   warningCount = 0;
   linkTarget.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, linkTarget);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('LinkTarget - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let docElement;
   let linkTarget;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the LinkTarget
   //--------------------------------------------------------------------------
   xml = "<linktarget ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "></linktarget>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   linkTarget = new LinkTarget();

   warningCount = 0;
   linkTarget.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   testAllAttributes(t, linkTarget);
   t.end();
});
