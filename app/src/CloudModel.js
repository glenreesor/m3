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
import {m3App} from "./main";

/**
 * A CloudModel describes the cloud around one object. This is implemented as an
 * object to make saving and loading as XML straight forward.
 *
 * @constructor
 */
export function CloudModel() {
   this._color = "#cccccc";
   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included in
                                    // getAsXml() output
   this._unknownTags = [];          // As above
} // CloudModel()

/**
 * Return this cloudModel representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 */
CloudModel.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let xml = [];

   // Generate my XML
   myAttributes = `COLOR="${this._color}" `;

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   xml.push('<cloud ' + myAttributes + '>');

   // Embedded tags that I don't understand
   this._unknownTags.forEach(function(t) {
      xml.push(t);
   });

   // Close my own tag
   xml.push('</cloud>');

   // Return
   return xml;
}; // getAsXml()

/**
 * Get the current cloud color.
 *
 * @return {string} - Current cloud color.
 */
CloudModel.prototype.getColor = function getColor() {
      return this._color;
}; // getColor()

/**
 * Load this cloudModel definition from XML.
 * @param {Element} element - the Element to be parsed
 * @return {void}
 */
CloudModel.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
   let i;
   let attribute;
   let attributeName;
   let childNode;
   let numAttributes;
   let numEmbeddedTags;
   let serializer;

   //-----------------------------------------------------------------------
   // Loop through attributes. Set the ones I know about and warn about the
   // ones I don't.
   //-----------------------------------------------------------------------
   numAttributes = element.attributes.length;

   for (i=0; i<numAttributes; i++) {
      attribute = element.attributes[i];
      attributeName = attribute.name.toLowerCase();

      if (attributeName === "color") {
         this.setColor(attribute.value);

      } else {
         // Preserve attributes (and case) we don't understand so they can be
         // exported
         this._unknownAttributes.push({attribute:`${attribute.name}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <cloud> attribute: " + attribute.name);
      }
   }

   //-----------------------------------------------------------------------
   // Save embedded tags that I don't know about
   //-----------------------------------------------------------------------
   numEmbeddedTags = element.childNodes.length;
   serializer = new XMLSerializer;

   for (i=0; i< numEmbeddedTags; i++) {
      childNode = element.childNodes[i];
      if (childNode.nodeType === 1) {
         this._unknownTags.push(serializer.serializeToString(childNode));
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                                     `Unexpected <cloud> embedded tag: ` +
                                     `${childNode.tagName}`);
      }
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created cloudModel.");
}; // loadFromXml1_0_1()

/**
 * Set the current cloud color.
 *
 * @param {string} color - Current cloud color.
 * @return {void}
 */
CloudModel.prototype.setColor = function setColor(color) {
      this._color = color;
}; // getColor()
