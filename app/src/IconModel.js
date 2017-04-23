"use strict";

// Copyright 2016-2017 Glen Reesor
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

import {Diagnostics} from './Diagnostics';
import {createXml, loadXml} from './xmlHelpers';
import {m3App} from './main';

// BUILTIN is required, thus we need a non-null default value
const ATTRIBUTE_DEFAULTS = new Map([['BUILTIN', 'm3']]);
const EXPECTED_EMBEDDED_TAGS = [];

/**
 * An IconModel describes a particular icon associated with a particular node.
 *
 * @constructor
 */
export function IconModel() {
   this._builtin = 'm3';   // This will be overwritten when loading from XML

   this._unexpectedAttributes = new Map(); // Attributes that m3 doesn't
                                           // understand We save these so they
                                           // can be included in getAsXml()
                                           // output
   this._unexpectedTags = [];              // As above
} // IconModel()

/**
 * Return this IconModel representation as an array of XML strings.
 * @return {string[]}   - Array of strings containing xml
 *
 */
IconModel.prototype.getAsXml = function getAsXml() {
   let attributes = new Map();
   let contentObject;
   let embeddedTags;
   let xml = [];

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set('BUILTIN', this._builtin);

   embeddedTags = [];

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("icon", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, embeddedTags,
                   this._unexpectedTags);

   return xml;
}; // getAsXml()

/**
 * Return the name of the icon
 *
 * @return {String} - The icon name
 */
IconModel.prototype.getName = function getName() {
   return this._builtin;
}; // getName()

/**
 * Parse the XML in the specified Element
 *
 * @param {Element} element - the Element to parse
 * @return {void}
 */
IconModel.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1(element) {
   let i;
   let embeddedTag;
   let loadedAttributes;
   let loadedTags;
   let numEmbeddedTags;
   let serializer;
   let tagName;
   let unexpectedAttributes;
   let unexpectedTags;

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      loadXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_EMBEDDED_TAGS);

   this._builtin = loadedAttributes.get("BUILTIN");

   this._unexpectedAttributes = unexpectedAttributes;
   this._unexpectedTags = unexpectedTags;

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
      "Created IconModel.");
}; // loadFromXml1_0_1()

/**
 * Set the icon name.
 *
 * @param {String} name - This IconModel's name
 * @return {void}
 */
IconModel.prototype.setName = function setName(name) {
   this._builtin = name;
}; // setName()
