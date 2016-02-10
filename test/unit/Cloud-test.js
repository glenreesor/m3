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
let Cloud = proxyquire('../../app/src/Cloud',
                        {
                           './Diagnostics': diagnosticsStub,
                           './main': mainStub
                        }).Cloud;

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
  * @param {Cloud} cloud - the Cloud to be tested
  * @return {void}
  */
function testAllAttributes(t, cloud) {

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 1,
      "all attributes listed in this file must be tested");

   t.equal(cloud.getColor(), allAttributes["color"],
      "color must match value that was loaded");

} // testAllAttributes

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('Cloud - Constructor', function (t) {
   let cloud;

   cloud = new Cloud();

   t.equal(cloud.getColor(), "#cccccc",
      "default color should be '#cccccc'");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('Cloud - set/get Color()', function (t) {
   const newColor = "#111111";
   let cloud;

   cloud = new Cloud();
   cloud.setColor(newColor);

   t.equal(cloud.getColor(), newColor,
      "getColor() should return the new color");

   t.end();
});

//-----------------------------------------------------------------------------
// getAsXml - Exported XML same as source XML
//-----------------------------------------------------------------------------
test('Cloud - getAsXml()', function (t) {
   let origXml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Cloud
   //--------------------------------------------------------------------------
   origXml = "<cloud ";
   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += "></cloud>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      let origObject;

      origObject = new Cloud();
      origObject.loadFromXml1_0_1(docElement);
      return origObject;
   });

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Creation of Cloud gets logged
//-----------------------------------------------------------------------------
test('Cloud - loadFromXml1_0_1() - Creation of Cloud gets logged',
   function (t) {

   let cloud;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Cloud
   //--------------------------------------------------------------------------
   xml = "<cloud ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += "></cloud>";

   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   cloud = new Cloud();
   logCount = 0;
   cloud.loadFromXml1_0_1(docElement);

   t.equal(logCount, 1,
      "creation of Cloud should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test('Cloud - loadFromXml1_0_1() - Lowercase tag and attribute names',
   function (t) {

   let cloud;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Cloud
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

   cloud = new Cloud();
   warningCount = 0;
   cloud.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, cloud);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test('Cloud - loadFromXml1_0_1() - Uppercase tag and attribute names',
   function (t) {

   let cloud;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Cloud
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

   cloud = new Cloud();
   warningCount = 0;
   cloud.loadFromXml1_0_1(docElement);

   t.equal(warningCount, 0,
      "no warnings should be generated on XML import");

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, cloud);

   t.end();
});

//-----------------------------------------------------------------------------
// loadFromXml1_0_1 - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('Cloud - loadFromXml1_0_1() - Unknown Attributes Get Logged',
   function (t) {

   let cloud;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the Cloud
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

   cloud = new Cloud();

   warningCount = 0;
   cloud.loadFromXml1_0_1(docElement);
   t.equal(warningCount, 2);

   testAllAttributes(t, cloud);
   t.end();
});
