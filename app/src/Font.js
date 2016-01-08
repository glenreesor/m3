"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License, version 3, as published by
// the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Mobile Mind Mapper.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A Font describes the font properties for a non-html node.
 *
 * @constructor
 */
function Font() {
   this._bold = false;
   this._italic = false;
   this._size = "12";
} // Font()

/**
 * Return this Font representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
Font.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let xml = [];

   // Generate my XML
   myAttributes = "";

   if (this._bold) {
      myAttributes += ' BOLD = "true"';
   }

   if (this._italic) {
      myAttributes += ' ITALIC = "true"';
   }

   myAttributes += ' SIZE="' + this._size + '"';

   xml.push('<font ' + myAttributes + '>');

   // Close my own tag
   xml.push('</font>');

   // Return
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
   let i;
   let attribute;
   let numAttributes;

   //-----------------------------------------------------------------------
   // Loop through attributes. Set the ones I know about and warn about the
   // ones I don't.
   //-----------------------------------------------------------------------
   numAttributes = element.attributes.length;

   for (i=0; i<numAttributes; i++) {
      attribute = element.attributes[i];

      if (attribute.name === "BOLD") {
         if (attribute.value === "true") {
            this._bold = true;
         } else {
            this._bold = false;
         }

      } else if (attribute.name === "ITALIC") {
         if (attribute.value === "true") {
            this._italic = true;
         } else  {
            this._italic = false;
         }

      } else if (attribute.name === "SIZE") {
         this._size = attribute.value;

      } else {
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <font> attribute: " + attribute.name);
      }
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created font.");
}; // loadFromXml1_0_1()
