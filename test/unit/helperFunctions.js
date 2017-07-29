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

/**
 * A stub that just records what it received as input and returns dummy xml.
 * @param {string}   tagName              - the name of the tag being processed
 * @param {Map}      attributeDefaults    - a complete list of all valid
 *                                          attributes for the tag being
 *                                          processed, along with their default
 *                                          values
 * @param {Map}      currentAttributes    - a list of all attributes and their
 *                                          current values
 * @param {Map}      unexpectedAttributes - a list of all attributes that were
 *                                          not expected (during loading), but
 *                                          need to be preserved for
 *                                          interoperability with Freeplane
 * @param {Object[]} embeddedTags         - an array of objects, each having
 *                                          a getAsXml() method that will be
 *                                          used for generating XML
 * @param {string[]} unexpectedTags       - an array of serialized tags that
 *                                          were not expected (during loading),
 *                                          but need to be preserved for
 *                                          interoperability with Freeplane
 *
 * @return {string[]} An array of strings that correspond to the complete
 *                    XML representation of the specified tag
 */
export function createXml (tagName, attributeDefaults, currentAttributes,
                           unexpectedAttributes, embeddedTags, unexpectedTags) {

   createXml.tagName = tagName;
   createXml.attributeDefaults = attributeDefaults;
   createXml.currentAttributes =  currentAttributes;
   createXml.unexpectedAttributes = unexpectedAttributes;
   createXml.embeddedTags = embeddedTags;
   createXml.unexpectedTags = unexpectedTags;
   return "<xml/>";
}

/**
 * Test that an object's exported attributes and tags are correct. We do
 * this by examining all objects that were saved by the stubbed createXml().
 *
 * @param {Object} t                    - test object from Tape
 * @param {Object} exportSavingObject   - the stub object that had all the
 *                                        passed-in parameters saved on it
 * @param {Map}    attributeDefaults    - expected default attributes
 * @param {Map}    expectedAttributes   - expected test attributes
 * @param {Map}    unexpectedAttributes - the unexpected attributes from
 *                                        initial load
 * @param {[]}     embeddedTags         - the expected embedded tags from
 *                                        initial load
 * @param {string[]} unexpectedTags     - the unexpected tags from initial
 *                                        load
 * @return {void}
 */
export function validateCreateXmlArgs(
   t,
   exportSavingObject,
   attributeDefaults,
   expectedAttributes,
   unexpectedAttributes,
   embeddedTags,
   unexpectedTags
) {

   //-------------------------------------------------------------------------
   // attributeDefaults
   //-------------------------------------------------------------------------
   t.equal(exportSavingObject.attributeDefaults.size, attributeDefaults.size,
      "all attribute defaults must be passed to helper");

   attributeDefaults.forEach(function (value, attributeName) {

      // Do a simple comparison if the types are primitives
      if (typeof(value) !== "object") {
         t.equal(
            exportSavingObject.attributeDefaults.get(attributeName),
            attributeDefaults.get(attributeName),
            `default attribute "${attributeName}" must be passed to ` +
               "createXml()"
         );
      } else {
         // So far the only non-primitive attributes we have are arrays,
         // so we can be lazy and assume this is an array.
         t.equal(
            exportSavingObject.attributeDefaults.get(attributeName).length,
            attributeDefaults.get(attributeName).length,
            `default attribute "${attributeName}" must be passed to ` +
               "createXml() and have same length"
         );

         exportSavingObject.attributeDefaults.get(attributeName)
            .forEach(function (value, index) {
               t.equal(
                  value,
                  attributeDefaults.get(attributeName)[index],
                  `default attribute "${attributeName}" must be passed to ` +
                     "createXml() and have same values in the array"
               );
         });
      }
   });

   //-------------------------------------------------------------------------
   // currentAttributes
   //-------------------------------------------------------------------------
   t.equal(exportSavingObject.currentAttributes.size, expectedAttributes.size,
      "all current attributes must be passed to helper");

   expectedAttributes.forEach(function (value, attributeName) {
      t.equal(exportSavingObject.currentAttributes.get(attributeName),
              expectedAttributes.get(attributeName),
              `current attribute "${attributeName}='${value}'" must be ` +
              "passed to createXml()");
   });

   //-------------------------------------------------------------------------
   // unexpectedAttributes
   //-------------------------------------------------------------------------
   t.equal(exportSavingObject.unexpectedAttributes.size,
           unexpectedAttributes.size,
           "all unexpected attributes must be passed to createXml()");

   unexpectedAttributes.forEach(function (value, attributeName) {
      t.equal(exportSavingObject.unexpectedAttributes.get(attributeName),
              unexpectedAttributes.get(attributeName),
              `unexpected attribute "${attributeName}='${value}'" must be ` +
              " passed to createXml()");
   });

   //-------------------------------------------------------------------------
   // embeddedTags
   //-------------------------------------------------------------------------
   t.equal(exportSavingObject.embeddedTags.length,
           embeddedTags.length,
           "all embedded tags must be passed to createXml()");

   embeddedTags.forEach(function (embeddedTag) {
      let found = false;

      exportSavingObject.embeddedTags.forEach(function (exportedTag) {
         if (embeddedTag.toString() === exportedTag.getAsXml().toString()) {
            found = true;
         }
      });
      t.equal(found, true,
              `tag "${embeddedTag}" must be passed to createXml()`);
   });

   //-------------------------------------------------------------------------
   // unexpectedTags
   //-------------------------------------------------------------------------
   t.equal(exportSavingObject.unexpectedTags.length,
           unexpectedTags.length,
           "all unexpected tags must be passed to createXml()");

   unexpectedTags.forEach(function (tag, i) {
      t.equal(exportSavingObject.unexpectedTags[i],
              unexpectedTags[i],
              `The following unexpected tag must be present: "${tag}"`);
   });
}
