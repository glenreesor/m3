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

const ATTRIBUTE_DEFAULTS = new Map([["COLOR", "#000000"],
                                    ["DESTINATION", ""],
                                    ["ENDARROW", ""],
                                    ["ENDINCLINATION", ""],
                                    ["ID", ""],
                                    ["SOURCE", ""],
                                    ["STARTARROW", ""],
                                    ["STARTINCLINATION", ""]]);
const EXPECTED_EMBEDDED_TAGS = [];

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

   this._unexpectedAttributes = null; // Attributes that m3 doesn't understand
                                      // We save these so they can be included
                                      // in getAsXml() output
   this._unexpectedTags = null;       // As above

   // Computed attributes that don't get saved
} // LinkTarget()

/**
 * Return this LinkTarget representation as an array of XML strings.
 *
 * @return {string[]}   - Array of strings containing xml
 */
LinkTarget.prototype.getAsXml = function getAsXml() {
   let attributes = new Map();
   let xml = [];

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set("COLOR", this._color);
   attributes.set("DESTINATION", this._destination);
   attributes.set("ENDARROW", this._endArrow);
   attributes.set("ENDINCLINATION", this._endInclination);
   attributes.set("ID", this._id);
   attributes.set("SOURCE", this._source);
   attributes.set("STARTARROW", this._startArrow);
   attributes.set("STARTINCLINATION", this._startInclination);

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("linktarget", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, [],
                   this._unexpectedTags);

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
   let loadedAttributes;
   let loadedTags;
   let unexpectedAttributes;
   let unexpectedTags;

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      loadXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_EMBEDDED_TAGS);

   this.setColor(loadedAttributes.get("COLOR"));
   this.setDestination(loadedAttributes.get("DESTINATION"));
   this.setEndArrow(loadedAttributes.get("ENDARROW"));
   this.setEndInclination(loadedAttributes.get("ENDINCLINATION"));
   this.setId(loadedAttributes.get("ID"));
   this.setSource(loadedAttributes.get("SOURCE"));
   this.setStartArrow(loadedAttributes.get("STARTARROW"));
   this.setStartInclination(loadedAttributes.get("STARTINCLINATION"));

   this._unexpectedAttributes = unexpectedAttributes;
   this._unexpectedTags = unexpectedTags;

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
