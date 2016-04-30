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

import {App} from "./App";
import {Diagnostics} from "./Diagnostics";
import {ErrorDialog} from "./ErrorDialog";
import {m3App} from "./main";
import {NodeModel} from "./NodeModel";
import {SaveDialog} from "./SaveDialog";

/**
 * A MapModel contains everything for a mind map.
 * @constructor
 * @param {Controller} controller - The controller for this app
 * @param {String} newType - Type of map--either new empty or new from XML
 *                           (See MapModel.TYPE_* constants)
 * @param {String} dbKey - the DB key associaetd with this map
 * @param {String} mapName - the name of this map
 * @param {String[]} xml - The array of XML strings describing this map
 *                         (if newType is xml)
 */
export function MapModel(controller, newType, dbKey, mapName, xml) {
   this._controller = controller;
   this._mapName = mapName;
   this._modifiedStatus = false;
   this._version = MapModel._DEFAULT_VERSION;
   this.setMapName(mapName);

   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
   this._unknownTags = [];          // As above

   if (newType === MapModel.TYPE_EMPTY) {
      this._dbKey = null;
      this._rootNode = new NodeModel(this._controller, this, NodeModel.TYPE_NEW,
                                     null, "New Map", null);
      this.setModifiedStatus(true);
   } else {
      this._dbKey = dbKey;
      this._loadFromXml(xml);
      this.setModifiedStatus(false);
   }
} // MapModel()

MapModel._DEFAULT_VERSION = "1.0.1";     // Right now we read and write Freemind version 1.0.1
MapModel.TYPE_EMPTY = "empty";           // Used by constructor
MapModel.TYPE_XML = "xml";               // Used by constructor

/**
 * Connect arrowLinks to the appropriate NodeModel, starting at the specified node
 * @param {NodeModel} startNode - The node at which to start (recursively)
 * @return {void}
 */
MapModel.prototype._connectArrowLinks = function _connectArrowLinks(startNode) {
   startNode.connectArrowLinks();

   startNode.getChildren().forEach((child) => {
      this._connectArrowLinks(child);
   });
}; // _connectArrowLinks()

/**
 * Return an array of strings containing this map as xml
 * @return {string[]} - This map in xml format, as an array of strings
 */
MapModel.prototype.getAsXml = function getAsXml() {
   let myAttributes;
   let mapAsXml = [];

   myAttributes = `version="${MapModel._DEFAULT_VERSION}" `;

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   // Preamble
   mapAsXml.push(`<map ${myAttributes}>`);

   // For now, this must stay here because FreeMind expects
   // embedded tag <attribute_registry> to be first embedded tab.
   
   // Embedded tags that I don't understand
   this._unknownTags.forEach(function(t) {
      mapAsXml.push(t);
   });

   // Loop through all root nodes of this map
   mapAsXml = mapAsXml.concat(this._rootNode.getAsXml());

   // Closing map node
   mapAsXml.push('</map>');

   // Return the full map
   return mapAsXml;

}; // getAsXml()

/**
 * Return the db key to use when saving this map.
 *
 * @return {string}  - Map db key for saving
 */
MapModel.prototype.getDbKey = function getDbKey() {
   return this._dbKey;
}; // getDbKey()

/**
 * Return the name to use when saving this map.
 *
 * @return {string}  - Map name for saving
 */
MapModel.prototype.getMapName = function getMapName() {
   return this._mapName;
}; // getMapName()

/**
 * Return the modified status of this map (true = modified)
 *
 * @return {boolean} - Is the map modified?
 */
MapModel.prototype.getModifiedStatus = function getModifiedStatus() {
   return this.modifiedStatus;
}; // getModifiedStatus()

/**
 * Return the NodeModel that has the specified ID.
 * @param  {NodeModel} startNode - The node to start searching from recursively
 * @param  {String} id - The ID being searched for
 * @return {NodeModel} - The NodeModel with the specified ID.
 */
MapModel.prototype.getNodeModelById = function getNodeModelById(startNode, id) {
   let child;
   let i;
   let nodeToReturn = null;

   if (startNode.getId() === id) {
      nodeToReturn = startNode;
   } else {
      for (i=0; i< startNode.getChildren().length && nodeToReturn === null; i++) {
         child = startNode.getChildren()[i];
         nodeToReturn = this.getNodeModelById(child, id);
      }
   }
   return nodeToReturn;
}; // getNodeModelById()

/**
 * Return the root node of this map
 *
 * @return {NodeModel} - The root node
 */
MapModel.prototype.getRoot = function getRoot() {
   return this._rootNode;
}; // getRoot()

/**
 * Return the XML version that was used to load this map
 *
 * @return {String} - The XML Version
 */
MapModel.prototype.getVersion = function getVersion() {
   return this._version;
}; // getVersion()

/**
  * Load the nodes for this map from the specified XML document.
  * @param {[String]} mapAsXml - The map stored as an array of XML strings
  * @return {void}
  */
MapModel.prototype._loadFromXml = function _loadFromXml(mapAsXml) {
   let domDocument;
   let mapElement;
   let mapAsOneXmlString;
   let parser;

   parser = new DOMParser();

   //--------------------------------------------------------------------------
   // Parse the XML
   //--------------------------------------------------------------------------
   mapAsOneXmlString = "";

   mapAsXml.forEach(function (element) {
      mapAsOneXmlString += element + "\n";
   });

   if (mapAsOneXmlString !== null) {
      try {
         domDocument = parser.parseFromString(mapAsOneXmlString, "text/xml");
      } catch (e) {
         m3App.getDiagnostics().err(Diagnostics.TASK_IMPORT_XML, "Error parsing XML.");
         m3App.getDiagnostics().err(Diagnostics.TASK_IMPORT_XML, e.message);
      }
   }

   // ---------------------------------------------------------------------
   // Get the <map> tag
   // ---------------------------------------------------------------------
   mapElement = domDocument.documentElement;
   if (mapElement.nodeName.toLowerCase() !== "map") {
      m3App.getDiagnostics().err(Diagnostics.TASK_IMPORT_XML,
                      "This doesn't look like a mind map file. Doesn't start with " +
                      "<map>");
      return;
   }

   // ---------------------------------------------------------------------
   // We have a map tag. Now call the loader for this particular version.
   // Warning about unknown attributes is done in the version-specific loader,
   // not here.
   // ---------------------------------------------------------------------
   this._version = mapElement.getAttribute("version") ||
                   mapElement.getAttribute("VERSION");

   if (this._version === "1.0.1") {
      this._loadFromXml1_0_1(mapElement);
   } else {
      m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                       "I'm not familiar with version '" + this._version +
                       "'. I'll pretend it's version '1.0.1'.");
      this._version = "1.0.1";
      this._loadFromXml1_0_1(mapElement);
   }

   // ---------------------------------------------------------------------
   // Map is loaded, so link up all the ArrowLink objects
   // ---------------------------------------------------------------------
   this._connectArrowLinks(this._rootNode);

   // ---------------------------------------------------------------------
   // Done loading root node (and thus all children recursively)
   // Tell this top-level node's view to draw itself
   // ---------------------------------------------------------------------
}; // _loadFromXml()

/**
  * Load this map assuming a 1.0.1 (freemind) format. Any attributes in this
  * element take precedence over default values set by the constructor.
  *
  * @param {Element}
  *           mapElement - The top level map element from a parsed XML file.
  * @return {void}
  */
MapModel.prototype._loadFromXml1_0_1 = function _loadFromXml1_0_1(mapElement) {
   let i;
   let attribute;
   let attributeName;
   let childNode;
   let newNode;
   let numAttributes;
   let numChildren;
   let serializer;

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Loading a version '" +
                   this._version + "' file.");
   // ---------------------------------------------------------------------
   // Here's how to deal with parsing errors:
   // For missing required tags/attributes:
   // - If appropriate values can be created, issue warning and continue
   // - If no appropriate values can be created, issue error and stop
   //
   // For unexpected tags/attributes:
   // - Issue warning and continue
   //
   // For unimplemented tags/attributes:
   // - Issue warning and continue
   // ---------------------------------------------------------------------

   // ---------------------------------------------------------------------
   // <map> attributes
   // ---------------------------------------------------------------------
   numAttributes = mapElement.attributes.length;

   for (i = 0; i < numAttributes; i++) {
      attribute = mapElement.attributes[i];
      attributeName = attribute.name.toLowerCase();

      if (attributeName !== "version") {
         // Preserve attributes we don't understand so they can be exported
         this._unknownAttributes.push({attribute:`${attributeName}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <map> attribute '" +
                          attribute.name + "' on tag <map>.");
      }
   }

   // ---------------------------------------------------------------------
   // Now the children of the <map> element.
   // Note:
   // - mapElement.childNodes is an array of xml "nodes" (things like
   // the text within a tag, comments in the xml, etc)
   //
   // - mapElement.children is an array of actual child tags. This would
   // be better than childNodes, but childNodes is not supported by
   // Safari
   // ---------------------------------------------------------------------
   numChildren = mapElement.childNodes.length;
   serializer = new XMLSerializer;

   for (i = 0; i < numChildren; i++) {
      childNode = mapElement.childNodes[i];

      // Only process if it is an Element
      if (childNode.nodeType === 1) {

         if (childNode.tagName.toLowerCase() === "node") {
            m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Loading <" +
                            childNode.tagName + ">");

            // Create the new NodeModel
            newNode = new NodeModel(this._controller, this, NodeModel.TYPE_XML, null, "", childNode);
            this._rootNode = newNode;
         } else {
            this._unknownTags.push(serializer.serializeToString(childNode));
            m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <map> embedded tag: <" +
                             childNode.tagName + ">");
         }
      }
   }
}; // _loadVersion1_0_1()

/**
  * Save this map to the DB.
  * @return {void}
  */
MapModel.prototype.save = function save() {
   let saveDialog;

   //--------------------------------------------------------------------------
   // Popup the SaveDialog if this hasn't been saved yet
   //--------------------------------------------------------------------------
   if (this._dbKey === null) {
      saveDialog = new SaveDialog();
   } else {
      App.myDB.setItem(this._dbKey, this.getAsXml()).then( () => {
         this.setModifiedStatus(false);
      }).catch( (err) => {
         let errorDialog = new ErrorDialog(`Error saving map '${this._mapName}' using key '${this._dbKey}': ${err}`);
      });
   }
}; // save()

/**
  * Set this map's DB key
  * @param {String} key - This map's DB key
  * @return {void}
  */
MapModel.prototype.setDbKey = function setDbKey(key) {
   this._dbKey = key;
}; // setDbKey()

/**
  * Set this map's name
  * @param {String} name - This map's name
  * @return {void}
  */
MapModel.prototype.setMapName = function setMapName(name) {
   this._mapName = name;
   this._controller.setMapName(name);
}; // setMapName()

/**
  * Set the modified status of this map.
  * @param {boolean} status - Either false (unmodified) or true (modified/unsaved)
  * @return {void}
  */
MapModel.prototype.setModifiedStatus = function setModifiedStatus(status) {
   this.modifiedStatus = status;
   this._controller.setModifiedIndicator(status);
}; // setModifiedStatus()
