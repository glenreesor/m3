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
import {createXml, processXml} from "./xmlHelpers";
import {m3App} from "./main";

const ATTRIBUTE_DEFAULTS = new Map([["COLOR", "#cccccc"]]);
const EXPECTED_EMBEDDED_TAGS = [];

/**
 * A CloudModel describes the cloud around one object. This is implemented as an
 * object to make saving and loading as XML straight forward.
 *
 * @constructor
 */
export function CloudModel() {
   this._color = "#cccccc";
   this._unexpectedAttributes = []; // Attributes that m3 doesn't understand
                                    // We save these so they can be included in
                                    // getAsXml() output
   this._unexpectedTags = [];       // As above
} // CloudModel()

/**
 * Return this cloudModel representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 */
CloudModel.prototype.getAsXml = function getAsXml() {
   let attributes = new Map();
   let xml = [];

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set("COLOR", this._color);

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("cloud", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, [],
                   this._unexpectedTags);

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
   let loadedAttributes;
   let loadedTags;
   let unexpectedAttributes;
   let unexpectedTags;

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      processXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_EMBEDDED_TAGS);

   this.setColor(loadedAttributes.get("COLOR"));

   this._unexpectedAttributes = unexpectedAttributes;
   this._unexpectedTags = unexpectedTags;

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
      "Created cloudModel.");
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
