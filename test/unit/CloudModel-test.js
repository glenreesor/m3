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
let CloudModel = proxyquire('../../app/src/CloudModel',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub
                           }).CloudModel;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   color: "#123456"
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {CloudModel} cloudModel - the CloudModel to be tested
  * @return {void}
  */
function testAllAttributes(t, cloudModel) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 1,
      "all attributes listed in this file must be tested");

   t.equal(cloudModel.getColor(), allAttributes["color"],
      "color must match value that was loaded");

} // testAllAttributes

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
// getAsXml - Exported XML same as source XML
//            This includes attributes and embedded tags that m3 doesn't
//            understand
//-----------------------------------------------------------------------------
test('CloudModel - getAsXml()', function (t) {
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
   // Setup XML to load the CloudModel
   //--------------------------------------------------------------------------
   origXml = "<cloud ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;
   origXml += ">";
   origXml += `${UNKNOWN_TAG1}${UNKNOWN_TAG2}`;

   origXml += "</cloud>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new CloudModel();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of CloudModel gets logged
//-----------------------------------------------------------------------------
test('CloudModel - loadFromXml1_0_1() - Creation of CloudModel gets logged',
   function (t) {

   let cloudModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the CloudModel
   //--------------------------------------------------------------------------
   xml = "<cloud ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "></cloud>";

   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   cloudModel = new CloudModel();
   logCount = 0;
   cloudModel.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of CloudModel should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('CloudModel - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let cloudModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the CloudModel
   //--------------------------------------------------------------------------
   xml = "<cloud ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += "></cloud>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   cloudModel = new CloudModel();
   warningCount = 0;
   cloudModel.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, cloudModel);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('CloudModel - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let cloudModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the CloudModel
   //--------------------------------------------------------------------------
   xml = "<CLOUD ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += "></CLOUD>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   cloudModel = new CloudModel();
   warningCount = 0;
   cloudModel.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, cloudModel);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('CloudModel - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let cloudModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the CloudModel
   //--------------------------------------------------------------------------
   xml = "<cloud ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "></cloud>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   cloudModel = new CloudModel();

   warningCount = 0;
   cloudModel.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   testAllAttributes(t, cloudModel);
   t.end();
});
