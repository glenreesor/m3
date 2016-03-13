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

let DOMParser = require('xmldom').DOMParser;

/**
 * A function to compare XML used to load an object with the XML exported
 * by that object to confirm:
 *    - all original attributes are present
 *    - all original embedded tags are present
 *
 * @param {String} origXml - the XML to be used in creating the object
 * @param {String} t - test object from Tape
 * @param {Function} constructorFn - the function to be called when constructing
 *                                   the object
 * @return {void}
 */
export function testExportedXml(origXml, t, constructorFn) {

   let attributes;
   let exportedAttributes;
   let exportedDocElement;
   let exportedEmbeddedTags;
   let exportedXml;
   let origAttributes;
   let origObject;
   let origDocElement;
   let origEmbeddedTags;
   let parser;

   parser = new DOMParser();

   //-----------------------------------------------------------------------
   // Create the object and get the exported XML
   //-----------------------------------------------------------------------
   origDocElement = parser.parseFromString(origXml, "text/xml")
                    .documentElement;
   origObject = constructorFn(origDocElement);

   exportedXml = origObject.getAsXml().join(" ");

   exportedDocElement = parser.parseFromString(exportedXml, "text/xml")
                        .documentElement;

   //-----------------------------------------------------------------------
   // Create sorted arrays of original attributes and embedded tags
   //-----------------------------------------------------------------------
   origAttributes = [];
   for (let i = 0; i < origDocElement.attributes.length; i++) {
      origAttributes.push(origDocElement.attributes[i]);
   }

   origAttributes.sort(function(a, b) {
      return a.name < b.name;
   });

   // Note that childNodes is an array of xml "nodes" (things like
   // text within a tag, etc). So when processing, we only care about
   // Elements (i.e. when nodeType is 1)
   origEmbeddedTags = [];
   for (let i = 0; i < origDocElement.childNodes.length; i++) {
      if (origDocElement.childNodes[i].nodeType === 1) {
         origEmbeddedTags.push(origDocElement.childNodes[i].tagName);
      }
   }

   origEmbeddedTags.sort();

   //-----------------------------------------------------------------------
   // Create sorted arrays of exported attributes and embedded tags
   //-----------------------------------------------------------------------
   exportedAttributes = [];
   for (let i = 0; i < exportedDocElement.attributes.length; i++) {
      exportedAttributes.push(exportedDocElement.attributes[i]);
   }

   exportedAttributes.sort(function(a, b) {
      return a.name < b.name;
   });

   exportedEmbeddedTags = [];
   for (let i = 0; i < exportedDocElement.childNodes.length; i++) {
      if (exportedDocElement.childNodes[i].nodeType === 1) {
         exportedEmbeddedTags.push(exportedDocElement.childNodes[i].tagName);
      }
   }

   exportedEmbeddedTags.sort();

   //-----------------------------------------------------------------------
   // Test that all attributes in the original XML are present in the
   // exported XML
   //-----------------------------------------------------------------------
   t.equal(exportedAttributes.length, origAttributes.length,
      "number of exported attributes must match number imported");

   exportedAttributes.forEach(function (el, i) {
      t.equal(el.name.toLowerCase(), origAttributes[i].name.toLowerCase(),
         "exported attribute names must match imported attribute names");

      t.equal(el.value, origAttributes[i].value,
         "exported attribute values must match imported attribute values");
   });

   //-----------------------------------------------------------------------
   // Test that all embedded tags in the original XML are present in the
   // exported XML
   //-----------------------------------------------------------------------
   t.equal(exportedEmbeddedTags.length, origEmbeddedTags.length,
      "number of exported embedded tags must match number imported");

   exportedEmbeddedTags.forEach(function (el, i) {
      t.equal(el.toLowerCase(), origEmbeddedTags[i].toLowerCase(),
         "exported embedded tags must match imported embedded tags");
   });
}
