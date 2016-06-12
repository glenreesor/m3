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
global.XMLSerializer = require('xmldom').XMLSerializer;

//-----------------------------------------------------------------------------
// Create proxyquire stubs
//-----------------------------------------------------------------------------
let diagnosticsStub;
let mainStub;
let warningCount;

warningCount = 0;

diagnosticsStub = {};
diagnosticsStub.Diagnostics = function Diagnostics(){};
diagnosticsStub.Diagnostics.TASK_IMPORT_XML = "Task Import Xml";
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
let createXml = proxyquire('../../app/src/xmlHelpers',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub
                           }).createXml;

let loadXml = proxyquire('../../app/src/xmlHelpers',
                           {
                              './Diagnostics': diagnosticsStub,
                              './main': mainStub
                           }).loadXml;

//-----------------------------------------------------------------------------
// createXml
//    - attributes only show up if not equal to their default values
//    - unexpectedAttributes are present
//    - embeddedTags are present
//    - unexpectedTags are present
//-----------------------------------------------------------------------------
test('xmlHelpers - createXml', function (t) {
   const ATTRIBUTES = new Map([['ATTRIBUTE1', 'default1'],
                               ['ATTRIBUTE2', 'non-default2'],
                               ['ATTRIBUTE3', 'default3'],
                               ['ATTRIBUTE4', 'non-default4']
                              ]);
   const ATTRIBUTE_DEFAULTS = new Map([['ATTRIBUTE1', 'default1'],
                                       ['ATTRIBUTE2', 'default2'],
                                       ['ATTRIBUTE3', 'default3'],
                                       ['ATTRIBUTE4', 'default4']
                                      ]);
   const EMBEDDED_TAG1 = {};
   const EMBEDDED_TAG2 = {};
   const EMBEDDED_TAGS = [EMBEDDED_TAG1, EMBEDDED_TAG2];
   const UNEXPECTED_ATTRIBUTES = new Map([['UNEXPECTED1', 'unexpectedV1'],
                                          ['UNEXPECTED2', 'unexpectedV2']
                                       ]);
   const UNEXPECTED_TAGS = ['<unexpectedTag1/>', '<unexpectedTag2/>'];
   const TAG_NAME = "testtag";

   EMBEDDED_TAG1.getAsXml = function() {
      return '<embeddedTag1/>';
   };

   EMBEDDED_TAG2.getAsXml = function() {
      return '<embeddedTag2/>';
   };

   let smushedXml;
   let xml;

   //-------------------------------------------------------------------------
   // Get the generated XML then smush it all together into one string
   //-------------------------------------------------------------------------
   xml = createXml(TAG_NAME, ATTRIBUTE_DEFAULTS, ATTRIBUTES,
                   UNEXPECTED_ATTRIBUTES, EMBEDDED_TAGS, UNEXPECTED_TAGS);

   smushedXml = xml.join("");

   t.equal(smushedXml,
      `<${TAG_NAME} ATTRIBUTE2="non-default2" ATTRIBUTE4="non-default4" ` +
      `UNEXPECTED1="unexpectedV1" UNEXPECTED2="unexpectedV2">` +
      `<embeddedTag1/><embeddedTag2/>` +
      `${UNEXPECTED_TAGS.join("")}</${TAG_NAME}>`,
      "xml must be correct");

   t.end();
});

//-----------------------------------------------------------------------------
// loadXml
//    - all specified attributes get returned
//    - attributes not present in XML get assigned default values
//    - attributes present in XML override defaults
//    - unexpected attributes are caught
//    - unexpected embedded tags are caught
//-----------------------------------------------------------------------------
test('xmlHelpers - loadXml', function (t) {
   const ATTRIBUTE_DEFAULTS = new Map([['ATTRIBUTE1', 'default1'],
                                       ['ATTRIBUTE2', 'default2'],
                                       ['ATTRIBUTE3', 'default3'],
                                       ['ATTRIBUTE4', 'default4']
                                      ]);
   const EXPECTED_TAGS = ['embeddedTag1', 'embeddedTag2'];
   const TAG_NAME = "testtag";

   const XML = `<${TAG_NAME} ATTRIBUTE2="non-default2" ` +
      `ATTRIBUTE4="non-default4" UNEXPECTED1="unexpectedV1" ` +
      `UNEXPECTED2="unexpectedV2">` +
      `<embeddedTag1/><embeddedTag2/>` +
      `<unexpectedTag1/><unexpectedTag2/></${TAG_NAME}>`;

   let element;
   let loadedAttributes;
   let loadedTags;
   let parser;
   let unexpectedAttributes;
   let unexpectedTags;

   parser = new DOMParser();
   element = parser.parseFromString(XML, "text/xml").documentElement;

   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      loadXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_TAGS);

   //-------------------------------------------------------------------------
   // loadedAttributes
   //-------------------------------------------------------------------------
   t.equal(loadedAttributes.size, 4);

   t.equal(loadedAttributes.get('ATTRIBUTE1'), 'default1',
           'loadedAttributes must take default value');

   t.equal(loadedAttributes.get('ATTRIBUTE2'), 'non-default2',
           'loadedAttributes must override default value');

   t.equal(loadedAttributes.get('ATTRIBUTE3'), 'default3',
           'loadedAttributes must take default value');

   t.equal(loadedAttributes.get('ATTRIBUTE4'), 'non-default4',
           'loadedAttributes must override default value');

   //-------------------------------------------------------------------------
   // unexpectedAttributes
   //-------------------------------------------------------------------------
   t.equal(unexpectedAttributes.get('UNEXPECTED1'), 'unexpectedV1',
           'unexpected attributes must be saved');

   t.equal(unexpectedAttributes.get('UNEXPECTED2'), 'unexpectedV2',
           'unexpected attributes must be saved');

   //-------------------------------------------------------------------------
   // loadedTags
   //-------------------------------------------------------------------------
   t.equal(loadedTags.length, 2);
   t.equal(loadedTags[0].tagName, "embeddedTag1",
           'embedded tags must be saved');

   t.equal(loadedTags[1].tagName, "embeddedTag2",
           'embedded tags must be saved');

   //-------------------------------------------------------------------------
   // unexpectedTags
   //-------------------------------------------------------------------------
   t.equal(unexpectedTags.length, 2);
   t.equal(unexpectedTags[0], '<unexpectedTag1/>',
           'unexpected tags must be preserved');

   t.equal(unexpectedTags[1], '<unexpectedTag2/>',
           'unexpected tags must be preserved');

   //-------------------------------------------------------------------------
   // Warnings for unexpected tags and attributes
   //-------------------------------------------------------------------------
   t.equal(warningCount, 4,
          'each unexpectedAttribute and unexpectedTag must generate a warning');

   t.end();
});
