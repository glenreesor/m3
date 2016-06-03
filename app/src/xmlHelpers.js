
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

import {Diagnostics} from "./Diagnostics";
import {m3App} from "./main";

/**
 * Create an array of strings that correspond to the XML representation of
 * the specified tag, attributes, and embedded tags. The resulting XML will
 * be of the form <tagname attribute1="value" attribute2="value">
 *                         <embedded2Tag> <embeddedTag2> </tagname>
 *
 * Attributes only show up in the output if they're different from their
 * corresponding default values.
 *
 * @param {string}   tagName              - the name of the tag being processed
 * @param {Map}      attributeDefaults    - a complete list of all valid
 *                                          attributes for the tag being
 *                                          processed, along with their default
 *                                          values
 * @param {Map}      attributes           - a list of all attributes and their
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
export function createXml(tagName, attributeDefaults, attributes,
                          unexpectedAttributes, embeddedTags, unexpectedTags) {

   let attributesAsString;
   let xml;

   xml = [];
   attributesAsString = getAttributesAsString(attributeDefaults, attributes,
                                              unexpectedAttributes);
   xml.push(`<${tagName} ${attributesAsString}>`);

   // <map> is a special case because Freemind can't load a map if
   // <attribute_registry> tag is not the first child. This won't be an
   // issue once <attribute_registry> is supported in m3
   if (tagName === 'map' && unexpectedTags.length >0) {
      unexpectedTags.forEach(function(serializedTag) {
         xml.push(serializedTag);
      });

      embeddedTags.forEach(function(tag) {
         xml = xml.concat(tag.getAsXml());
      });

   } else {
      embeddedTags.forEach(function(tag) {
         xml = xml.concat(tag.getAsXml());
      });

      unexpectedTags.forEach(function(serializedTag) {
         xml.push(serializedTag);
      });
   }

   xml.push(`</${tagName}>`);
   return xml;
}

/**
 * Process the specified XML element and return processed attributes and
 * embedded tags, separating the unexpected attributes and embedded tags
 * from the expected ones.
 *
 * @param {Element}  xmlElement        - the XML element to be processed, in
 *                                       parsed form as returned by a DOMParser
 * @param {Map}      attributeDefaults - a complete list of all valid attributes
 *                                       for the tag being processed, along with
 *                                       their default values
 * @param {string[]} expectedTags      - a list of valid embeddable tag names
 *
 * @return {[Map, Map, Object[], string[]]}
 *          {Map} loadedAttributes     - Loaded attributes. All attributes
 *                                       specified in the defaults will be
 *                                       present. Their values will either come
 *                                       from xmlElement, or a default
 *          {Map} unexpectedAttributes - Attributes that were not listed in
 *                                       defaults
 *          {Element[]} loadedTags     - Embedded (valid) parsed XML tags
 *          {string[]} unexpectedTags  - An array of serialized embedded tags
 *                                       that were not expected during load,
 *                                       but must be maintained for
 *                                       interoperability with Freeplane
 */
export function processXml(xmlElement, attributeDefaults, expectedTags) {
   let loadedAttributes;
   let loadedTags;
   let unexpectedAttributes;
   let unexpectedTags;

   [loadedAttributes, unexpectedAttributes] = loadAttributes(
      xmlElement.tagName, xmlElement.attributes, attributeDefaults);

   [loadedTags, unexpectedTags] = loadTags(
      xmlElement.tagName, xmlElement.childNodes, expectedTags);

   return [loadedAttributes, unexpectedAttributes,
           loadedTags, unexpectedTags];
} // processXml()

/**
 * Return a string containing the specified attributes, suitable to be embedded
 * in an XML tag.
 *    - attributes are only saved if not equal to the default value
 *    - all unexpected attributes are also saved
 *
 * @param {Map} defaults             - list of all valid attributes and their
 *                                     corresponding defaults
 * @param {Map} attributes           - list of all valid attributes and their
 *                                     current values
 * @param {Map} unexpectedAttributes - all attributes that were unexpected
 *                                     upon load
 * @return {String} - a string representation of all attributes attributes
 *                    with non-default values, and all unexpectedAttributes
 */
function getAttributesAsString(defaults, attributes, unexpectedAttributes) {
   let result = "";
   let first = true;

   attributes.forEach(function (value, attributeName) {
      if (value !== defaults.get(attributeName)) {
         if (first) {
            result = `${attributeName}="${value}"`;
            first = false;
         } else  {
            result += ` ${attributeName}="${value}"`;
         }
      }
   });

   unexpectedAttributes.forEach(function (value, attributeName) {
      if (first) {
         result = `${attributeName}="${value}"`;
         first = false;
      } else {
         result += ` ${attributeName}="${value}"`;
      }
   });

   return result;
} // getAttributesAsString()

/**
 * Load the attributes from xmlAttributes into loadedAttributes, using
 * the specified defaults for attributes that aren't in xmlAttributes.
 *
 * defaults lists all valid attributes, thus any xmlAttributes not in defaults
 * are saved in unexpectedAttributes.
 *
 * @param {String} tagName             - The tag name currently being loaded
 *                                       (for warning messages)
 * @param {NamedNodeMap} xmlAttributes - The attributes to be loaded
 * @param {Map} defaults               - List of all valid attributes and their
 *                                       corresponding default values
 *
 * @return {[Map, Map]}    {Map} loadedAttributes     - Loaded attributes
 *                         {Map} unexpectedAttributes - Attributes that were not
 *                                                      listed in defaults
 */
function loadAttributes(tagName, xmlAttributes, defaults) {
   let attribute;
   let i;
   let loadedAttributes;
   let num;
   let unexpectedAttributes;

   loadedAttributes = new Map();
   unexpectedAttributes = new Map();

   // Set all attributes based on the defaults provided
   defaults.forEach(function (value, attributeName) {
      loadedAttributes.set(attributeName, value);
   });

   // Overwrite with any values specified in xmlAttributes. Any attributes
   // in xmlAttributes that aren't in defaults are unexpected and must be
   // logged
   num = xmlAttributes.length;

   for (i=0; i< num; i++) {
      attribute = xmlAttributes[i];
      if (loadedAttributes.has(attribute.name)) {
         loadedAttributes.set(attribute.name, attribute.value);
      } else {
         unexpectedAttributes.set(attribute.name, attribute.value);
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
            `<${tagName}>: Unexpected attribute: ` +
            `${attribute.name}="${attribute.value}"`);
      }
   }

   return [loadedAttributes, unexpectedAttributes];
} // loadAttributes()

/**
 * Load the tags present in childNodes. Each tag is either expected,
 * or unexpected.
 *
 * @param {string}     tagName      - The name of the parent tag being processed
 * @param {NodeList[]} childNodes   - An array of child XML nodes, that includes
 *                                    embedded tags.
 * @param {string[]}   expectedTags - The list of tags that are expected
 *                                    (i.e. valid)
 *
 * @return {[Element[], string]}
 *             {Element[]} loadedTags     - the tags that were valid, in parsed
 *                                          form as returned by a DOMParser
 *             {string[]}  unexpectedTags - serialized versions of the tags that
 *                                          were not expected
 */
function loadTags(tagName, childNodes, expectedTags) {
   let i;
   let loadedTags;
   let numChildNodes;
   let serializedTag;
   let serializer;
   let unexpectedTags;
   let xmlChildNode;

   loadedTags = [];
   unexpectedTags = [];
   serializer = new XMLSerializer;

   numChildNodes = childNodes.length;

   for (i=0; i<numChildNodes; i++) {
      xmlChildNode = childNodes[i];

      // - Element.childNodes (used in this method) is an array of xml "nodes"
      //   (things like the text within a tag, comments in the xml, etc)
      //
      // - Element.children is an array of actual child tags. This would
      //   be better than childNodes, but children is not supported by
      //   Safari
      if (xmlChildNode.nodeType === 1) {

         if (expectedTags.indexOf(xmlChildNode.tagName) >= 0) {
            loadedTags.push(xmlChildNode);
         } else {
            serializedTag = serializer.serializeToString(xmlChildNode);
            unexpectedTags.push(serializedTag);
            m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
               `<${tagName}>: Unexpected embedded tag: ` +
               `${serializedTag}`);
         }
      }
   }
   return [loadedTags, unexpectedTags];
}
