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

import {Diagnostics} from "./Diagnostics";
import {createXml, loadXml} from "./xmlHelpers";
import {m3App} from "./main";

const ATTRIBUTE_DEFAULTS = new Map([["BOLD", "false"],
                                    ["ITALIC", "size"],
                                    ["SIZE", "12"]]);
const EXPECTED_EMBEDDED_TAGS = [];

/**
 * A Font describes the font properties for a non-html node.
 *
 * @constructor
 */
export function Font() {
   this._bold = false;
   this._italic = false;
   this._size = "12";
   this._unexpectedAttributes = new Map(); // Attributes that m3 doesn't
                                           // understand We save these so they
                                           // can be included in getAsXml()
                                           // output
   this._unexpectedTags = [];              // As above
} // Font()

/**
 * Return this Font representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
Font.prototype.getAsXml = function getAsXml() {
   let attributes = new Map();
   let xml = [];

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   if (this._bold === true) {
      attributes.set("BOLD", "true");
   } else {
      attributes.set("BOLD", "false");
   }

   if (this._italic === true) {
      attributes.set("ITALIC", "true");
   } else {
      attributes.set("ITALIC", "false");
   }

   attributes.set("SIZE", this._size);

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("font", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, [],
                   this._unexpectedTags);

   return xml;
}; // getAsXml()

/**
 * Return this font size
 *
 * @return {String} - Font size
 */
Font.prototype.getSize = function getSize() {
   return this._size;
}; // getSize()

/**
 * Return whether this font is bold
 *
 * @return {boolean} - Bold?
 */
Font.prototype.isBold = function isBold() {
   return this._bold;
}; // isBold()

/**
 * Return whether this font is italic
 *
 * @return {boolean} - Italics?
 */
Font.prototype.isItalic = function isItalic() {
   return this._italic;
}; // isItalic()

/**
 * Parse the XML in the specified Element
 *
 * @param {Element} element - the Element to parse
 * @return {void}
 */
Font.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
   let loadedAttributes;
   let loadedTags;
   let unexpectedAttributes;
   let unexpectedTags;

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      loadXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_EMBEDDED_TAGS);

   if (loadedAttributes.get("BOLD") === "true") {
      this._bold = true;
   } else {
      this._bold = false;
   }

   if (loadedAttributes.get("ITALIC") === "true") {
      this._italic = true;
   } else {
      this._italic = false;
   }

   this._size = loadedAttributes.get("SIZE");

   this._unexpectedAttributes = unexpectedAttributes;
   this._unexpectedTags = unexpectedTags;

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created font.");
}; // loadFromXml1_0_1()

/**
 * Set whether this font is bold
 *
 * @param {boolean} isBold - Is the text bold (true/false)
 * @return {void}
 */
Font.prototype.setBold = function setBold(isBold) {
   this._bold = isBold;
}; // setBold()

/**
 * Set whether this font is italic
 *
 * @param {boolean} isItalic - Is the text italic (true/false)
 * @return {void}
 */
Font.prototype.setItalic = function setItalic(isItalic) {
   this._italic = isItalic;
}; // setItalic()

/**
 * Set the font size
 *
 * @param {String} size - Font size
 * @return {void}
 */
Font.prototype.setSize = function setSize(size) {
   this._size = size;
}; // setSize()
