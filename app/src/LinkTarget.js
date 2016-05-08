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
 * A LinkTarget describes the the endpoint of a graphic link.
 *
 * @constructor
 */
export function LinkTarget() {
   // Attributes that get saved
   this._color = null;
   this._destination = null;     // This is the ID string
   this._endArrow = null;
   this._endInclination = null;
   this._id = null;
   this._source = null;          // This is the ID string
   this._startArrow = null;
   this._startInclination = null;

   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
   this._unknownTags = [];          // As above

   // Computed attributes that don't get saved
} // LinkTarget()

/**
 * Return this LinkTarget representation as an array of XML strings.
 *
 * @return {string[]}   - Array of strings containing xml
 */
LinkTarget.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let xml = [];

   // Generate my XML
   myAttributes = `COLOR="${this._color}" ` +
                  `DESTINATION="${this._destination}" ` +
                  `ENDARROW="${this._endArrow}" ` +
                  `ENDINCLINATION="${this._endInclination}" ` +
                  `ID="${this._id}" ` +
                  `SOURCE="${this._source}" ` +
                  `STARTARROW="${this._startArrow}" ` +
                  `STARTINCLINATION="${this._startInclination}" `;

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   xml.push('<linktarget ' + myAttributes + '>');

   // Embedded tags that I don't understand
   this._unknownTags.forEach(function(t) {
      xml.push(t);
   });

   // Close my own tag
   xml.push('</linktarget>');

   // Return
   return xml;
}; // getAsXml()

/**
  * Get the LinkTarget's color
  * @return {String} - The color of this LinkTarget
  */
LinkTarget.prototype.getColor = function getColor() {
   return this._color;
}; // getColor()

/**
  * Get the LinkTarget's destination node
  * @return {String} - The destination node ID of this LinkTarget
  */
LinkTarget.prototype.getDestination = function getDestination() {
   return this._destination;
}; // getDestination()

/**
  * Get the LinkTarget's end error type
  * @return {String} - The end arrow type
  */
LinkTarget.prototype.getEndArrow = function getEndArrow() {
   return this._endArrow;
}; // getEndArrow()

/**
  * Get the LinkTarget's end inclination
  * @return {String} - The end inclination
  */
LinkTarget.prototype.getEndInclination = function getEndInclination() {
   return this._endInclination;
}; // getEndInclination()

/**
  * Get the LinkTarget's ID
  * @return {String} - This LinkTarget's ID
  */
LinkTarget.prototype.getId = function getId() {
   return this._id;
}; // getId()

/**
  * Get the LinkTarget's source node
  * @return {String} - The source node ID of this LinkTarget
  */
LinkTarget.prototype.getSource = function getSource() {
   return this._source;
}; // getSource()

/**
  * Get the LinkTarget's start arrow type
  * @return {String} - The start arrow type
  */
LinkTarget.prototype.getStartArrow = function getStartArrow() {
   return this._startArrow;
}; // getStartArrow()

/**
  * Get the LinkTarget's start inclincation
  * @return {String} - The start inclincation
  */
LinkTarget.prototype.getStartInclination = function getStartInclination() {
   return this._startInclination;
}; // getStartInclination()

/**
 * Load this LinkTarget definition from XML.
 * @param {Element} element - the Element to parse
 * @return {void}
 */
LinkTarget.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
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

      } else if (attributeName === "destination") {
         this.setDestination(attribute.value);

      } else if (attributeName === "endarrow") {
         this.setEndArrow(attribute.value);

      } else if (attributeName === "endinclination") {
         this.setEndInclination(attribute.value);

      } else if (attributeName === "id") {
         this.setId(attribute.value);

      } else if (attributeName === "source") {
         this.setSource(attribute.value);

      } else if (attributeName === "startarrow") {
         this.setStartArrow(attribute.value);

      } else if (attributeName === "startinclination") {
         this.setStartInclination(attribute.value);

      } else {
         // Preserve attributes (and case) we don't understand so they can be
         // exported
         this._unknownAttributes.push({attribute:`${attribute.name}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
            "Unexpected <linktarget> attribute: " + attribute.name);
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
                                     `Unexpected <linktarget> embedded tag: ` +
                                     `${childNode.tagName}`);
      }
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
      "Created linktarget.");
}; // loadFromXml1_0_1()

/**
  * Set the LinkTarget's color
  * @param {String} color - The color
  * @return {void}
  */
LinkTarget.prototype.setColor = function setColor(color) {
   this._color = color;
}; // setColor()

/**
  * Set the LinkTarget's destination node
  * @param {String} destination - The destination
  * @return {void}
  */
LinkTarget.prototype.setDestination = function setDestination(destination) {
   this._destination = destination;
}; // setDestination()

/**
  * Set the LinkTarget's end error type
  * @param {String} endArrow - The end arrow type
  * @return {void}
  */
LinkTarget.prototype.setEndArrow = function setEndArrow(endArrow) {
   this._endArrow = endArrow;
}; // setEndArrow()

/**
  * Set the LinkTarget's end inclination
  * @param {String} endInclination - The end inclination
  * @return {void}
  */
LinkTarget.prototype.setEndInclination =
   function setEndInclination(endInclination) {

   this._endInclination = endInclination;
}; // setEndInclination()

/**
  * Set the LinkTarget's ID
  * @param {String} id - The ID
  * @return {void}
  */
LinkTarget.prototype.setId = function setId(id) {
   this._id = id;
}; // setId()

/**
  * Set the LinkTarget's source node
  * @param {String} source - The source node
  * @return {void}
  */
LinkTarget.prototype.setSource = function setSource(source) {
   this._source = source;
}; // setSource()

/**
  * Set the LinkTarget's start arrow type
  * @param {String} startArrow - The start arrow type
  * @return {void}
  */
LinkTarget.prototype.setStartArrow = function setStartArrow(startArrow) {
   this._startArrow = startArrow;
}; // setStartArrow()

/**
  * Set the LinkTarget's start inclincation
  * @param {String} startInclination - The start inclincation
  * @return {void}
  */
LinkTarget.prototype.setStartInclination =
   function setStartInclination(startInclination) {

   this._startInclination = startInclination;
}; // setStartInclination()
