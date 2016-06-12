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
 * this by examining the objects that were saved by the stubbed createXml().
 *
 * @param {Object} t                    - test object from Tape
 * @param {Object} exportSavingObject   - the stub object that had all the
 *                                        passed-in parameters saved on it
 * @param {Map}    loadedAttributes     - the attributes that were initially
 *                                        loaded
 * @param {Map}    unexpectedAttributes - the simulated unexpected attributes
 *                                        from initial load
 * @param {string} oneAttribute         - the name of an attribute that can be
 *                                        used to confirm attributes list
 * @param {string} defaultValue         - the default value for the above
 *                                        attribute
 * @param {[]}     embeddedTags         - the expected embedded tags
 *                                        from initial load
 * @param {string} unexpectedTags       - the simulated unexpected tags
 *                                        from initial load
 *
 * @return {void}
 */
export function testExportedAttributesAndTags(t, exportSavingObject,
                                              loadedAttributes,
                                              unexpectedAttributes,
                                              oneAttribute, defaultValue,
                                              embeddedTags, unexpectedTags) {
   let unexpectedAttributeName;

   // Overkill to test all attributeDefaults. Just need to confirm that
   // the right Map was passed, so just test:
   //    - attributeDefaults is the same size as our map of test attributes
   //    - one of the defaults is correct
   t.equal(exportSavingObject.attributeDefaults.size, loadedAttributes.size,
      "attribute defaults must be passed to helper");

   t.equal(exportSavingObject.attributeDefaults.get(oneAttribute), defaultValue,
      "attribute defaults must be passed to helper");

   // Overkill to test all attributes, so just test:
   //    - saved attributes is the same size as our map of test attributes
   //    - one attribute is correct
   t.equal(exportSavingObject.currentAttributes.size, loadedAttributes.size,
      "attributes must be passed to helper");

   t.equal(exportSavingObject.currentAttributes.get(oneAttribute),
      loadedAttributes.get(oneAttribute),
      "attributes must be passed to the helper");

   // Overkill to test all unexpected attributes, so just test:
   //    - saved unexpectedAttributes is the same size as our initial unexpected
   //      attributes
   //    - one unexpected attribute is correct
   t.equal(exportSavingObject.unexpectedAttributes.size,
      unexpectedAttributes.size,
      "unexpected attributes must be preserved");

   unexpectedAttributeName = unexpectedAttributes.keys()[0];
   t.equal(exportSavingObject.unexpectedAttributes.get(unexpectedAttributeName),
      unexpectedAttributes.get(unexpectedAttributeName),
      "unexpected attributes must be preserved");

   // Rather than test that all embedded tags are present, just
   // make sure the number of exported tags is equal to the number loaded
   t.equal(exportSavingObject.embeddedTags.length, embeddedTags.length,
      "embedded tags must be preserved.");

   // Overkill to test all unexpected tags, so just test:
   //    - saved unexpectedTags is the same size as our initial unexpected
   //      tags
   //    - one unexpected tag is correct
   t.equal(exportSavingObject.unexpectedTags[0], unexpectedTags[0],
      "unexpected tags must be preserved");

}
