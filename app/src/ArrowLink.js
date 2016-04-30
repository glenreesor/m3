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
 * A ArrowLink describes the starting point of a graphic link.
 *
 * @constructor
 */
export function ArrowLink() {
   // Attributes that get saved
   this._destinationId = null;    // This is the ID (a string), not a pointer to the actual NodeModel object
   this._color = "#000000";
   this._endArrow = null;
   this._endInclination = null;
   this._id = null;
   this._startArrow = null;
   this._startInclination = null;
   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
   this._unknownTags = [];          // As above

   // Computed attributes that don't get saved
   this._destinationNode = null;      // This is a pointer to the actual NodeModel object
} // ArrowLink()

/**
 * Connect to destinationNode NodeModel object.
 *
 * @param {MapModel} mapModel - the MapModel that contains this ArrowLink
 * @return {void}
 */
ArrowLink.prototype.connectToNodeModel = function connectToNodeModel(mapModel) {
   this._destinationNode = mapModel.getNodeModelById(mapModel.getRoot(), this._destinationId);
}; // connectToNodeModel()

/**
 * Return this ArrowLink representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
ArrowLink.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let xml = [];

   // Generate my XML
   myAttributes = `DESTINATION="${this._destinationId}" ` +
                  `COLOR="${this._color}" ` +
                  `ENDARROW="${this._endArrow}" ` +
                  `ENDINCLINATION="${this._endInclination}" ` +
                  `ID="${this._id}" ` +
                  `STARTARROW="${this._startArrow}" ` +
                  `STARTINCLINATION="${this._startInclination}" `;

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   xml.push('<arrowlink ' + myAttributes + '>');

   // Embedded tags that I don't understand
   this._unknownTags.forEach(function(t) {
      xml.push(t);
   });

   // Close my own tag
   xml.push('</arrowlink>');

   // Return
   return xml;
}; // getAsXml()

/**
 * Get the color for this ArrowLink
 * @return {String} the color, specified as a hex rgb triple
 */
ArrowLink.prototype.getColor = function getColor() {
   return this._color;
}; // getcolor()

/**
  * Get the ArrowLink's destination ID
  * @return {String} - The destination ID
  */
ArrowLink.prototype.getDestinationId = function getDestinationId() {
   return this._destinationId;
}; // setDestinationId()

/**
  * Get the ArrowLink's destination node
  * @return {NodeModel} - The destination node (not an ID)
  */
ArrowLink.prototype.getDestinationNode = function getDestinationNode() {
   return this._destinationNode;
}; // setDestinationNode()

/**
  * Get the ArrowLink's end error type
  * @return {String} - The end arrow type
  */
ArrowLink.prototype.getEndArrow = function getEndArrow() {
   return this._endArrow;
}; // getEndArrow()

/**
  * Get the ArrowLink's end inclination
  * @return {String} - The end inclination
  */
ArrowLink.prototype.getEndInclination = function getEndInclination() {
   return this._endInclination;
}; // getEndInclination()

/**
  * Get the ArrowLink's ID
  * @return {String} - The ID
  */
ArrowLink.prototype.getId = function getId() {
   return this._id;
}; // getId()

/**
  * Get the ArrowLink's start arrow type
  * @return {String} - The start arrow type
  */
ArrowLink.prototype.getStartArrow = function getStartArrow() {
   return this._startArrow;
}; // getStartArrow()

/**
  * Get the ArrowLink's start inclincation
  * @return {String} - The start inclincation
  */
ArrowLink.prototype.getStartInclination = function getStartInclination() {
   return this._startInclination;
}; // getStartInclination()

/**
 * Load this ArrowLink definition from XML.
 *
 * @param {Element} element - The element to be parsed
 * @return {void}
 */
ArrowLink.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
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
         this.setDestinationId(attribute.value);

      } else if (attributeName === "endarrow") {
         this.setEndArrow(attribute.value);

      } else if (attributeName === "endinclination") {
         this.setEndInclination(attribute.value);

      } else if (attributeName === "id") {
         this.setId(attribute.value);

      } else if (attributeName === "startarrow") {
         this.setStartArrow(attribute.value);

      } else if (attributeName === "startinclination") {
         this.setStartInclination(attribute.value);

      } else {
         // Preserve attributes (and case) we don't understand so they can be
         // exported
         this._unknownAttributes.push({attribute:`${attribute.name}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <arrowlink> attribute: " + attribute.name);
      }
   }

   //-----------------------------------------------------------------------
   // Save embedded tags that I don't know about
   //-----------------------------------------------------------------------
   numEmbeddedTags = element.childNodes.length;
   serializer = new XMLSerializer();

   for (i=0; i< numEmbeddedTags; i++) {
      childNode = element.childNodes[i];
      if (childNode.nodeType === 1) {
         this._unknownTags.push(serializer.serializeToString(childNode));
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                                     `Unexpected <arrowlink> embedded tag: ` +
                                     `${childNode.tagName}`);
      }
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created arrowlink.");
}; // loadFromXml1_0_1()

/**
 * Set the color for this ArrowLink
 * @param {String} color - the color, specified as a hex rgb triple
 * @return {void}
 */
ArrowLink.prototype.setColor = function setColor(color) {
   this._color = color;
}; // setColor()

/**
 * Set the ArrowLink's destination node
 * @param {String} destinationId - The destination
 * @return {void}
 */
ArrowLink.prototype.setDestinationId = function setDestinationId(destinationId) {
   this._destinationId = destinationId;
}; // setDestination()

/**
 * Set the ArrowLink's end error type
 * @param {String} endArrow - The end arrow type
 * @return {void}
 */
ArrowLink.prototype.setEndArrow = function setEndArrow(endArrow) {
   this._endArrow = endArrow;
}; // setEndArrow()

/**
 * Set the ArrowLink's end inclination
 * @param {String} endInclination - The end inclination
 * @return {void}
 */
ArrowLink.prototype.setEndInclination = function setEndInclination(endInclination) {
   this._endInclination = endInclination;
}; // setEndInclination()

/**
 * Set the ArrowLink's ID
 * @param {String} id - The ID
 * @return {void}
 */
ArrowLink.prototype.setId = function setId(id) {
   this._id = id;
}; // setId()

/**
 * Set the ArrowLink's start arrow type
 * @param {String} startArrow - The start arrow type
 * @return {void}
 */
ArrowLink.prototype.setStartArrow = function setStartArrow(startArrow) {
   this._startArrow = startArrow;
}; // setStartArrow()

/**
 * Set the ArrowLink's start inclincation
 * @param {String} startInclination - The start inclincation
 * @return {void}
 */
ArrowLink.prototype.setStartInclination = function setStartInclination(startInclination) {
   this._startInclination = startInclination;
}; // setStartInclination()
