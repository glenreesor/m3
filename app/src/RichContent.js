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
import {createXml, processXml} from "./xmlHelpers";
import {m3App} from "./main";

const ATTRIBUTE_DEFAULTS = new Map([["TYPE", ""]]);

/**
 * A RichContent describes either a node's note, or the rich text of a note.
 *
 * @constructor
 */
export function RichContent() {
   this._content = null;
   this._type = null;
   this._unexpectedAttributes = []; // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
   this._unexpectedTags = [];       // As above
} // RichContent()

/**
 * Return this RichContent representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
RichContent.prototype.getAsXml = function getAsXml() {
   let attributes = new Map();
   let contentObject;
   let embeddedTags;
   let xml = [];

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set("TYPE", this._type);

   //-------------------------------------------------------------------------
   // There is one embedded tag, which is the content, but we have to fake
   // out an object that has a getAsXml() method.
   //-------------------------------------------------------------------------
   contentObject = {};
   contentObject._content = this._content;
   contentObject.getAsXml = function getAsXml() {
      return [this._content];
   };

   embeddedTags = [contentObject];

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("richcontent", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, embeddedTags,
                   this._unexpectedTags);

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
   let embeddedTag;
   let expectedTags;
   let loadedAttributes;
   let loadedTags;
   let numEmbeddedTags;
   let serializer;
   let tagName;
   let unexpectedAttributes;
   let unexpectedTags;

   serializer = new XMLSerializer();

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   expectedTags = ["html"];

   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      processXml(element, ATTRIBUTE_DEFAULTS, expectedTags);

   this._type = loadedAttributes.get("TYPE");

   this._unexpectedAttributes = unexpectedAttributes;
   this._unexpectedTags = unexpectedTags;

   //-----------------------------------------------------------------------
   // Pick out the content.
   //-----------------------------------------------------------------------
   numEmbeddedTags = loadedTags.length;

   for (i=0; i<numEmbeddedTags; i++) {
      embeddedTag = loadedTags[i];
      tagName = embeddedTag.tagName;
      if (tagName === "html") {
         this._content = serializer.serializeToString(embeddedTag);
      }
   }

   if (this._content === null) {
      m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                                  "No content in <richcontent>");
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
      "Created richcontent.");
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
