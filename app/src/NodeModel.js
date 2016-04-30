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

import {ArrowLink} from "./ArrowLink";
import {CloudModel} from "./CloudModel";
import {Diagnostics} from "./Diagnostics";
import {Font} from "./Font";
import {LinkTarget} from "./LinkTarget";
import {RichContent} from "./RichContent";
import {m3App} from "./main";

/**
 * A NodeModel contains everything for a mind map node. The constructor
 * creates a mind map node using the specified text.
 *
 * @constructor
 * @param {Controller} controller - The controller for this app
 * @param {MapModel} myMapModel - The MapModel this NodeModel is in
 * @param {string} newType - What type of new node is this?
 *                           (See NodeModel.TYPE*)
 * @param {NodeModel} parent - The parent of this new NodeModel
 * @param {string} text - The text for this node (if type NEW)
 * @param {Element} parsedXml - The parsed xml used to create this node
                                (if type XML)
 */
export function NodeModel(controller, myMapModel, newType, parent, text,
                          parsedXml) {
   this._controller = controller;
   this._myMapModel = myMapModel;

   // Set defaults (that may get overridden if loading from XML)
   this._parent = parent;

   // Optional Attributes
   this._arrowLinks = [];
   this._backgroundColor = "#ffffff";
   this._children = [];
   this._cloudModel = null;
   this._font = null;                  // Will point to Font object if there are non-default font properties
   this._isFolded = false;
   this._linkTargets = [];
   this._note = null;                  // Will point to the corresponding RichContent object
   this._richText = null;              // Will point to the corresponding RichContent object
   this._textColor = "#000000";

   this._unknownAttributes = [];    // Attributes that m3 doesn't understand
                                    // We save these so they can be included
                                    // in getAsXml() output
   this._unknownTags = [];          // As above

   // First level children must have their position set. For now only allow
   // right side
   if (parent !== null && parent.getParent() === null) {
      this._position = NodeModel.POSITION_RIGHT;
   } else {
      this._position = null;
   }

   if (newType === NodeModel.TYPE_NEW) {
      // Set required attributes
      this._created = Date.now();
      this._id = "ID_" + this._created;
      this._modified = this._created;
      this._text = text;

   } else {
      this._text = null;
      this._loadFromXml1_0_1(parsedXml);
   }
} // NodeModel()

NodeModel.POSITION_NONE = "none";
NodeModel.POSITION_RIGHT = "right";   // XML value used only for first level nodes
NodeModel.POSITION_LEFT = "left";     // XML value used only for first level nodes
NodeModel.TYPE_NEW = "new";            // Used by constructor
NodeModel.TYPE_XML = "xml";            // Used by constructor

/**
 * Create a new child node using the specified text.
 *
 * @param {String} text - The text to be put in the newly created child node
 *
 * @return {NodeModel} - The child NodeModel that was created.
 */
NodeModel.prototype.addChild = function addChild(text) {
   let childNode = new NodeModel(this._controller, this._myMapModel, NodeModel.TYPE_NEW, this, text);
   this._children.push(childNode);
   this._myMapModel.setModifiedStatus(true);
   return childNode;
}; // addChild()

/**
 * Create a new child node after the specified child, using the specified text.
 *
 * @param {NodeModel} previousSibling - the sibling before the newly created node
 * @param {String} text - The text to be put in the newly created child node
 *
 * @return {NodeModel} - The child NodeModel that was created.
 */
NodeModel.prototype.addChildAfter = function addChildAfter(previousSibling, text) {
   let childNode = new NodeModel(this._controller, this._myMapModel, NodeModel.TYPE_NEW, this, text);
   this._children.splice(this._children.indexOf(previousSibling)+1, 0, childNode);
   this._myMapModel.setModifiedStatus(true);
   return childNode;
}; // addChildAfter()

/**
 * Link the ArrowLink objects to corresponding NodeModel objects, for this NodeModel
 *
 * @return {void}
 */
NodeModel.prototype.connectArrowLinks = function connectArrowLinks() {
   this._arrowLinks.forEach( (arrowLink) => {
      arrowLink.connectToNodeModel(this._myMapModel);
   });
}; // connectArrowLinks()

/**
 * Delete the specified child node.
 *
 * @param {NodeModel} child - The child node to be deleted
 * @return {void}
 */
NodeModel.prototype.deleteChild = function deleteChild(child) {
   // Deleting the child model effectively deletes all of that node's children
   this._children.splice(this._children.indexOf(child), 1);
   this._myMapModel.setModifiedStatus(true);
}; // deleteChild()

/**
 * Return the arrowLink objects for this node.
 * @return {ArrowLink[]} - This node's arrowLinks (empty array if none)
 *
 */
NodeModel.prototype.getArrowLinks = function getArrowLinks() {
   return this._arrowLinks;
}; // getArrowLinks()

/**
 * Return an array of strings containing this node (and children) as
 * xml
 * @return {string[]} - Array of strings containing xml
 *
 */
NodeModel.prototype.getAsXml = function getAsXml() {
   let i;
   let myAttributes;
   let xml = [];
   let tempText;           // Used for removing special XML characters

   // Generate my XML
   myAttributes = `CREATED="${this._created}" ` +
                  `ID="${this._id}" ` +
                  `MODIFIED="${this._modified}" `;

   if (this._text !== null) {
      // Remove the following from text: & < > " '
      // Assume the user isn't using XML entities in their text :-)
      tempText = this._text.replace(new RegExp("&", "g"), "&amp;");
      tempText = tempText.replace(new RegExp("<", "g"), "&lt;");
      tempText = tempText.replace(new RegExp(">", "g"), "&gt;");
      tempText = tempText.replace(new RegExp('"', "g"), "&quot;");
      tempText = tempText.replace(new RegExp("'", "g"), "&apos;");
      myAttributes += `TEXT="${tempText}" `;
   }

   if (this._position !== null) {
      myAttributes += `POSITION="${this._position}" `;
   }

   if (this._backgroundColor !== "#ffffff") {
      myAttributes += `BACKGROUND_COLOR="${this._backgroundColor}" `;
   }

   if (this._isFolded === true) {
      myAttributes += `FOLDED="${this._isFolded}" `;
   }

   if (this._textColor !== "#000000") {
      myAttributes += `COLOR="${this._textColor}" `;
   }

   // Include attributes that were in the input file that m3 didn't understand
   this._unknownAttributes.forEach(function(a) {
      myAttributes += `${a.attribute}="${a.value}" `;
   });

   xml.push('<node ' + myAttributes + '>');

   this._arrowLinks.forEach( (arrowLink) => {
      xml = xml.concat(arrowLink.getAsXml());
   });

   if (this._cloudModel !== null) {
      xml = xml.concat(this._cloudModel.getAsXml());
   }

   if (this._font !== null) {
      xml = xml.concat(this._font.getAsXml());
   }

   this._linkTargets.forEach( (linkTarget) => {
      xml = xml.concat(linkTarget.getAsXml());
   });

   if (this._richText !== null) {
      xml = xml.concat(this._richText.getAsXml());
   }

   if (this._note !== null) {
      xml = xml.concat(this._note.getAsXml());
   }

   // Loop through all of my child nodes
   for (i=0; i<this._children.length; i++) {
      xml = xml.concat(this._children[i].getAsXml());
   }

   // Embedded tags that I don't understand
   this._unknownTags.forEach(function(t) {
      xml.push(t);
   });

   // Close my own tag
   xml.push('</node>');

   // Return
   return xml;
}; // getAsXml()

/**
 * Return the background color of this node
 *
 * @return {string} the background color of this node, specified as a hex rgb
 * triple
 */
NodeModel.prototype.getBackgroundColor = function getBackgroundColor() {
   return this._backgroundColor;
}; // getBackgroundColor()

/**
 * Return the array of children of this node
 *
 * @return {NodeModel[]} an array of children of this node
 */

NodeModel.prototype.getChildren = function getChildren() {
   return this._children;
}; // getChildren()

/**
 * Return this node's CloudModel object
 *
 * @return {CloudModel} This node's CloudModel object (null if no cloud)
 */
NodeModel.prototype.getCloudModel = function getCloudModel() {
   return this._cloudModel;
}; // getCloudModel()

/**
 *
 * Return this node's created timestamp
 * @return {String} - This node's created timestamp
 */
NodeModel.prototype.getCreatedTimestamp = function getCreatedTimestamp() {
   return this._created;
}; // getCreatedTimestamp()

/**
 * Return this node's font object
 *
 * @return {Font} This node's font object (null if no non-default values)
 */
NodeModel.prototype.getFont = function getFont() {
   return this._font;
}; // getFont()

/**
 *
 * Return the ID of this node
 * @return {String} - This node's ID
 */
NodeModel.prototype.getId = function getId() {
   return this._id;
}; // getId()

/**
 * Return the linkTarget objects for this node.
 * @return {LinkTarget[]} - This node's linkTargets (empty array if none)
 *
 */
NodeModel.prototype.getLinkTargets = function getLinkTargets() {
   return this._linkTargets;
}; // getLinkTargets()

/**
 *
 * Return this node's modified timestamp
 * @return {String} - This node's modified timestamp
 */
NodeModel.prototype.getModifiedTimestamp = function getModifiedTimestamp() {
   return this._modified;
}; // getModifiedTimestamp()

/**
 *
 * Return this node's note
 * @return {String} - This node's note (null if none)
 */
NodeModel.prototype.getNote = function getNote() {
   let returnVal;

   returnVal = null;
   if (this._note !== null) {
      returnVal = this._note.getContent();
   }

   return returnVal;
}; // getNote()

/**
 * Return the parent node of this node
 *
 * @return {NodeModel} - the parent of this node
 */
NodeModel.prototype.getParent = function getParent() {
   return this._parent;
}; // getParent()

/**
 * Return the rich text for this node (null if not formatted as rich text)
 *
 * @return {Element} - the rich text of this node
 */
NodeModel.prototype.getRichText = function getRichText() {
   let returnVal;

   returnVal = null;
   if (this._richText !== null) {
      returnVal = this._richText.getContent();
   }

   return returnVal;
}; // getRichText()

/**
  * Return the side this node should be drawn on. If this node doesn't know
  * what side it should be drawn on, return the side of its parent
  *
  * @return {String} - NodeModel.POSITION_LEFT or NodeModel.POSITION_RIGHT
  */
NodeModel.prototype.getSide = function getSide() {
   let returnVal;

   if (this._position !== null) {
      returnVal = this._position;
   } else {
      if (this._parent !== null) {
         returnVal = this._parent.getSide();
      } else {
         returnVal = NodeModel.POSITION_NONE;
      }
   }

   return returnVal;
}; // getSide()

/**
 * Return the text for this node
 *
 * @return {String} - the text for this node
 */
NodeModel.prototype.getText = function getText() {
   return this._text;
}; // getText()

/**
 * Return the text color of this node
 *
 * @return {String} - the text color of this node as a hex rgb triple
 */
NodeModel.prototype.getTextColor = function getTextColor() {
   return this._textColor;
}; // getTextColor()

/**
 * Return whether this node has a cloud or not
 *
 * @return {boolean} - true (this is a cloud) or false (there isn't a cloud)
 */
NodeModel.prototype.hasCloud = function hasCloud() {
   if (this._cloudModel !== null) {
      return true;
   } else {
      return false;
   }
};

/**
 * Return whether this node is folded or not
 *
 * @return {boolean} - folded status (true or false)
 */
NodeModel.prototype.isFolded = function isFolded() {
   return this._isFolded;
};

/**
 * Load this mind map node from the specified xml element. Any
 * attributes in this element take precedence over default values
 * set by the constructor.
 *
 * @param {Element} element - The XML element to be parsed
 * @return {void}
 */
NodeModel.prototype._loadFromXml1_0_1 = function _loadFromXml1_0_1(element) {
   let i;
   let arrowLink;
   let attribute;
   let attributeName;
   let xmlChildNode;
   let newNode;
   let numAttributes;
   let numXmlChildNodes;
   let richContent;
   let richContentType;
   let linkTarget;
   let serializer;
   let tagName;

   //-----------------------------------------------------------------------
   // Loop through attributes. Set the ones I know about and warn about the
   // ones I don't.
   //-----------------------------------------------------------------------
   numAttributes = element.attributes.length;

   for (i=0; i<numAttributes; i++) {
      attribute = element.attributes[i];
      attributeName = attribute.name.toLowerCase();

      if (attributeName === "background_color") {
         this._backgroundColor = attribute.value;

      } else if (attributeName === "created") {
         this._created = attribute.value;

      } else if (attributeName === "color") {
         this._textColor = attribute.value;

      } else if (attributeName === "folded") {
         if (attribute.value === "true") {
            this._isFolded = true;
         } else {
            this._isFolded = false;
         }

      } else if (attributeName === "id") {
         this._id = attribute.value;

      } else if (attributeName === "modified") {
         this._modified = attribute.value;

      } else if (attributeName === "position") {
         this._position = attribute.value;

      } else if (attributeName === "text") {
         this._text = attribute.value;

      } else {
         // Preserve attributes (and case) we don't understand so they can be
         // exported
         this._unknownAttributes.push({attribute:`${attribute.name}`,
                                       value:`${attribute.value}`});
         m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML, "Unexpected <node> attribute: " + attribute.name);
      }
   }

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML, "Created node: " + this._text);

   //-----------------------------------------------------------------------
   // Load child mind map nodes.
   // Note:
   //      - mapElement.childNodes is an array of xml "nodes" (things like
   //        the text within a tag, comments in the xml, etc)
   //
   //      - mapElement.children is an array of actual child tags. This would
   //        be better than childNodes, but childNodes is not supported by
   //        Safari
   //---------------------------------------------------------------------
   numXmlChildNodes = element.childNodes.length;
   serializer = new XMLSerializer;

   for (i=0; i<numXmlChildNodes; i++) {
      xmlChildNode = element.childNodes[i];

      // Only process this if it is an Element
      if (xmlChildNode.nodeType === 1) {
         tagName = xmlChildNode.tagName.toLowerCase();

         if (tagName === "node") {
            m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
                  "Loading <" + xmlChildNode.tagName + ">");
            newNode = new NodeModel(this._controller, this._myMapModel, NodeModel.TYPE_XML, this, "", xmlChildNode);
            this._children.push(newNode);

         } else if (tagName === "arrowlink") {
            arrowLink = new ArrowLink();
            arrowLink.loadFromXml1_0_1(xmlChildNode);
            this._arrowLinks.push(arrowLink);

         } else if (tagName === "cloud") {
            this._cloudModel = new CloudModel();
            this._cloudModel.loadFromXml1_0_1(xmlChildNode);

         } else if (tagName === "font") {
            this._font = new Font();
            this._font.loadFromXml1_0_1(xmlChildNode);

         } else if (tagName === "linktarget") {
            linkTarget = new LinkTarget();
            linkTarget.loadFromXml1_0_1(xmlChildNode);
            this._linkTargets.push(linkTarget);

         } else if (tagName === "richcontent") {
            richContent = new RichContent();
            richContent.loadFromXml1_0_1(xmlChildNode);
            richContentType = richContent.getType().toLowerCase();

            if (richContentType === "node") {
               this._richText = richContent;
            } else if (richContentType === "note") {
               this._note = richContent;
            } else {
               m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                  "Unexpected type of richcontent: " + richContent.getType());
            }

         } else {
            this._unknownTags.push(serializer.serializeToString(xmlChildNode));
            m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
                  "Unexpected <node> embedded tag: <" + xmlChildNode.tagName + ">");
         }
      }
   }
}; // _loadFromXml1_0_1()

/**
 * Set the background color to something new.
 *
 * @param {String} color - the new background color for this node.
 * @return {void}
 */
NodeModel.prototype.setBackgroundColor = function setBackgroundColor(color) {
   this._backgroundColor = color;
   this._modified = Date.now();
   this._myMapModel.setModifiedStatus(true);
}; // setBackgroundColor()

/**
 * Set the text to something new.
 *
 * @param {String} text - the new text for this node.
 * @return {void}
 */
NodeModel.prototype.setText = function setText(text) {
   this._text = text;
   this._modified = Date.now();
   this._myMapModel.setModifiedStatus(true);
}; // setText()

/**
 * Set the text color
 *
 * @param {String} textColor - the new text color for this node.
 * @return {void}
 */
NodeModel.prototype.setTextColor = function setTextColor(textColor) {
   this._textColor = textColor;
   this._modified = Date.now();
   this._myMapModel.setModifiedStatus(true);
}; // setTextColor()

/**
 * Toggle the cloud
 * @return {void}
 */
NodeModel.prototype.toggleCloud = function toggleCloud() {
   if (this._cloudModel === null) {
      this._cloudModel = new CloudModel();
   } else {
      this._cloudModel = null;
   }

   this._hasCloud = !this._hasCloud;

   this._myMapModel.setModifiedStatus(true);
}; // toggleCloud()

/**
 * Toggle the folded status
 * @return {void}
 */
NodeModel.prototype.toggleFoldedStatus = function toggleFoldedStatus() {
   this._isFolded = !this._isFolded;
   this._myMapModel.setModifiedStatus(true);
}; // toggleFoldedStatus()
