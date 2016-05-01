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

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let ArrowLink = proxyquire('../../app/src/ArrowLink',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub
                           }).ArrowLink;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   color: "#123456",
   destination: "ID_123456",
   endarrow: "none",
   endinclination: "155;0;",
   id: "ID_654321",
   startarrow: "none",
   startinclination: "150;0;"
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {ArrowLink} arrowLink - the arrowLink to be tested
  * @return {void}
  */
function testAllAttributes(t, arrowLink) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 7,
      "all attributes listed in this file must be tested");

   t.equal(arrowLink.getColor(), allAttributes["color"],
      "color must match value that was loaded");

   t.equal(arrowLink.getDestinationId(), allAttributes["destination"],
      "destination must match value that was loaded");

   t.equal(arrowLink.getEndArrow(), allAttributes["endarrow"],
      "endArrow must match value that was loaded");

   t.equal(arrowLink.getEndInclination(), allAttributes["endinclination"],
      "endInclination must match value that was loaded");

   t.equal(arrowLink.getId(), allAttributes["id"],
      "id must match value that was loaded");

   t.equal(arrowLink.getStartArrow(), allAttributes["startarrow"],
      "startArrow must match value that was loaded");

   t.equal(arrowLink.getStartInclination(), allAttributes["startinclination"],
      "startInclination must match value that was loaded");
} // testAllAttributes

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

   arrowLink = new ArrowLink();

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
// getAsXml - Exported XML same as source XML
//            This includes attributes and embedded tags that m3 doesn't
//            understand
//-----------------------------------------------------------------------------
test('ArrowLink - getAsXml()', function (t) {
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
   // Setup XML to load the ArrowLink
   //--------------------------------------------------------------------------
   origXml = "<arrowlink ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;
   origXml += ">";
   origXml += `${UNKNOWN_TAG1}${UNKNOWN_TAG2}`;

   origXml += "</arrowlink>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new ArrowLink();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of ArrowLink gets logged
//-----------------------------------------------------------------------------
test('ArrowLink - loadFromXml1_0_1() - Creation of ArrowLink gets logged',
   function (t) {

   let arrowLink;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the ArrowLink
   //--------------------------------------------------------------------------
   xml = "<arrowlink ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "></arrowlink>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   arrowLink = new ArrowLink();
   logCount = 0;
   arrowLink.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of the ArrowLink should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('ArrowLink - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let docElement;
   let arrowLink;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the ArrowLink. All attributes lowercase
   //--------------------------------------------------------------------------
   xml = "<arrowlink ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += "></arrowlink>";

   //--------------------------------------------------------------------------
   // Load the ArrowLink
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   arrowLink = new ArrowLink();
   warningCount = 0;
   arrowLink.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes
   //--------------------------------------------------------------------------
   testAllAttributes(t, arrowLink);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('ArrowLink - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let docElement;
   let arrowLink;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the ArrowLink. All attributes uppercase
   //--------------------------------------------------------------------------
   xml = "<ARROWLINK ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += "></ARROWLINK>";

   //--------------------------------------------------------------------------
   // Load the ArrowLink
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   arrowLink = new ArrowLink();
   warningCount = 0;
   arrowLink.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes
   //--------------------------------------------------------------------------
   testAllAttributes(t, arrowLink);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('ArrowLink - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let arrowLink;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the ArrowLink
   //--------------------------------------------------------------------------
   xml = "<arrowlink ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "></arrowlink>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   arrowLink = new ArrowLink();

   warningCount = 0;
   arrowLink.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   //--------------------------------------------------------------------------
   // Test all known attributes
   //--------------------------------------------------------------------------
   testAllAttributes(t, arrowLink);

   t.end();
});
