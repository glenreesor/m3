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
 * A RichContent describes either a node's note, or the rich text of a note.
 *
 * @constructor
 */
export function RichContent() {
   this._content = null;
   this._type = null;
   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
} // RichContent()

/**
 * Return this RichContent representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
RichContent.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let xml = [];

   // Generate my XML
   myAttributes = `TYPE="${this._type}" `;

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   xml.push('<richcontent ' + myAttributes + '>');
   xml.push(this._content);

   // Close my own tag
   xml.push('</richcontent>');

   // Return
   return xml;
}; // getAsXml()

/**
 * Return the text
 *
 * @return {String} - The text
 */
RichContent.prototype.getContent = function getContent() {
   return this._content;
}; // getContent()

/**
 * Return this RichContent's type
 *
 * @return {String} - The type (e.g. "node" or "note")
 */
RichContent.prototype.getType = function getType() {
   return this._type;
}; // getType()

/**
 * Parse the XML in the specified Element
 *
 * @param {Element} element - the Element to parse
 * @return {void}
 */
RichContent.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
   let i;
   let attribute;
   let attributeName;
   let numAttributes;
   let numXmlChildNodes;
   let serializer;
   let xmlChildNode;

   serializer = new XMLSerializer();

   //-----------------------------------------------------------------------
   // Loop through attributes. Set the ones I know about and warn about the
   // ones I don't.
   //-----------------------------------------------------------------------
   numAttributes = element.attributes.length;

   for (i=0; i<numAttributes; i++) {
      attribute = element.attributes[i];
      attributeName = attribute.name.toLowerCase();

      if (attributeName === "type") {
         this._type = attribute.value;

      } else {
         // Preserve attributes (and case) we don't understand so they can be
         // exported
         this._unknownAttributes.push({attribute:`${attribute.name}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                                     "Unexpected <richcontent> attribute: " +
                                     attribute.name);
      }
   }

   //-----------------------------------------------------------------------
   // Pick out the content. Since it's rich content (as opposed to straight
   // text), it'll have a nodeType of 1
   //-----------------------------------------------------------------------
   numXmlChildNodes = element.childNodes.length;

   for (i=0; i<numXmlChildNodes; i++) {
      xmlChildNode = element.childNodes[i];

      if (xmlChildNode.nodeType === 1) {
         this._content = serializer.serializeToString(xmlChildNode);
         break;
      }
   }

   if (this._content === null) {
      m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                                  "No content in <richcontent>");
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created richcontent.");
}; // loadFromXml1_0_1()

/**
 * Set the type
 *
 * @param {String} type - This richcontent's type
 * @return {void}
 */
RichContent.prototype.setType = function setType(type) {
   this._type = type;
}; // setType()

/**
 * Set the content
 *
 * @param {String} content - This richcontent's content
 * @return {void}
 */
RichContent.prototype.setContent = function setContent(content) {
   this._content = content;
}; // setContent()
