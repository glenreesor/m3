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
import {createXml, loadXml} from "./xmlHelpers";
import {NodeView} from "./NodeView";
import {RichContent} from "./RichContent";
import {m3App} from "./main";

const ATTRIBUTE_DEFAULTS = new Map([["BACKGROUND_COLOR", "#ffffff"],
                                    ["CREATED", ""],
                                    ["COLOR", "#000000"],
                                    ["FOLDED", "false"],
                                    ["ID", ""],
                                    ["MODIFIED", ""],
                                    ["POSITION", ""],
                                    ["TEXT", ""]]);
const EXPECTED_EMBEDDED_TAGS = ["arrowlink", "cloud", "font", "linktarget",
                                "node", "richcontent"];

/**
 * A NodeModel contains everything for a mind map node. The constructor
 * creates a mind map node using the specified text.
 *
 * @constructor
 * @param {Controller} controller - The controller for this app
 * @param {MapModel} myMapModel   - The MapModel this NodeModel is in
 * @param {string} newType        - What type of new node is this?
 *                                  (See NodeModel.TYPE*)
 * @param {NodeModel} parent      - The parent of this new NodeModel
 * @param {string[]} text         - The text for this node (if type NEW)
 *                                  each element corresponds to one line of text
 * @param {Element} parsedXml     - The parsed xml used to create this node
                                    (if type XML)
 */
export function NodeModel(controller, myMapModel, newType, parent, text,
                          parsedXml) {
   this._controller = controller;
   this._myMapModel = myMapModel;
   this._myView = null;

   // Set defaults (that may get overridden if loading from XML)
   this._parent = parent;

   // Optional Attributes
   this._arrowLinks = [];
   this._backgroundColor = "#ffffff";
   this._children = [];
   this._cloudModel = null;
   this._font = null;             // Points to Font object
   this._isFolded = false;
   this._linkTargets = [];
   this._note = null;             // Points to corresponding RichContent object
   this._richText = null;         // Points to corresponding RichContent object
   this._textColor = "#000000";

   this._unexpectedAttributes = new Map(); // Attributes that m3 doesn't
                                           // understand We save these so they
                                           // can be included in getAsXml()
                                           // output
   this._unexpectedTags = [];              // As above

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
NodeModel.POSITION_RIGHT = "right";   // XML value. Only for first level nodes
NodeModel.POSITION_LEFT = "left";     // XML value. Only for first level nodes
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
   let childNode = new NodeModel(this._controller, this._myMapModel,
                                 NodeModel.TYPE_NEW, this, text);
   this._children.push(childNode);
   this._myMapModel.setModifiedStatus(true);
   return childNode;
}; // addChild()

/**
 * Create a new child node after the specified child, using the specified text.
 *
 * @param {NodeModel} previousSibling - the sibling before the newly created
 *                                      node
 * @param {String} text - The text to be put in the newly created child node
 *
 * @return {NodeModel} - The child NodeModel that was created.
 */
NodeModel.prototype.addChildAfter = function addChildAfter(previousSibling,
                                                           text) {
   let childNode = new NodeModel(this._controller, this._myMapModel,
                                 NodeModel.TYPE_NEW, this, text);
   this._children.splice(this._children.indexOf(previousSibling)+1, 0,
                         childNode);
   this._myMapModel.setModifiedStatus(true);
   return childNode;
}; // addChildAfter()

/**
 * Link the ArrowLink objects to corresponding NodeModel objects, for this
 * NodeModel
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
   let attributes;
   let embeddedTags;
   let allLines;
   let xml = [];
   let tempText;           // Used for removing special XML characters

   attributes = new Map();

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set("CREATED", this._created);
   attributes.set("ID", this._id);
   attributes.set("MODIFIED", this._modified);

   if (this._text !== null) {
      allLines = '';

      // Loop through each line of text, adding an escape newline character
      // where required.
      this._text.forEach( function(line, index) {
         // Remove the following from text: & < > " '
         tempText = line.replace(new RegExp("&", "g"), "&amp;");
         tempText = tempText.replace(new RegExp("<", "g"), "&lt;");
         tempText = tempText.replace(new RegExp(">", "g"), "&gt;");
         tempText = tempText.replace(new RegExp('"', "g"), "&quot;");
         tempText = tempText.replace(new RegExp("'", "g"), "&apos;");

         if (index !== 0) {
            allLines += '&#xa;' + tempText;
         } else {
            allLines = tempText;
         }
      });
      attributes.set("TEXT", allLines);
   }

   // Only save the position for children of the root
   if (this._parent !== null && this._parent.getParent() === null) {
      attributes.set("POSITION", this._position);
   } else {
      attributes.set("POSITION", ATTRIBUTE_DEFAULTS.get("POSITION"));
   }

   attributes.set("BACKGROUND_COLOR", this._backgroundColor);

   if (this._isFolded === true) {
      attributes.set("FOLDED", "true");
   } else {
      attributes.set("FOLDED", "false");
   }

   attributes.set("COLOR", this._textColor);

   //-------------------------------------------------------------------------
   // Load up embedded tags
   //-------------------------------------------------------------------------
   embeddedTags = [];

   this._arrowLinks.forEach( (arrowLink) => {
      embeddedTags.push(arrowLink);
   });

   if (this._cloudModel !== null) {
      embeddedTags.push(this._cloudModel);
   }

   if (this._font !== null) {
      embeddedTags.push(this._font);
   }

   this._linkTargets.forEach( (linkTarget) => {
      embeddedTags.push(linkTarget);
   });

   if (this._richText !== null) {
      embeddedTags.push(this._richText);
   }

   if (this._note !== null) {
      embeddedTags.push(this._note);
   }

   // Loop through all of my child nodes
   for (i=0; i<this._children.length; i++) {
      embeddedTags.push(this._children[i]);
   }

   //-------------------------------------------------------------------------
   // Get my complete xml
   //-------------------------------------------------------------------------
   xml = createXml("node", ATTRIBUTE_DEFAULTS, attributes,
                   this._unexpectedAttributes, embeddedTags,
                   this._unexpectedTags);

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
  * Return the side this node should be drawn on. Only the root or children
  * of the root know which side they should be drawn on.
  * All others ask their parents.
  *
  * @return {String} - NodeModel.POSITION_LEFT or NodeModel.POSITION_RIGHT
  */
NodeModel.prototype.getSide = function getSide() {
   let returnVal;

   if (this._parent === null) {
      returnVal = NodeModel.POSITION_NONE;
   } else if (this._parent.getParent() === null) {
      returnVal = this._position;
   } else {
      returnVal = this._parent.getSide();
   }

   return returnVal;
}; // getSide()

/**
 * Return the text for this node
 *
 * @return {String[]} - the text for this node. Each element in the array
 *                      corresponds to one line of text.
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
 * Get this NodeModel's view, creating it on the fly if
 * required.
 *
 * @return {NodeView} - this NodeModel's NodeView
 */
NodeModel.prototype.getView = function getView() {
   if (this._myView === null) {
      this._myView = new NodeView(this._controller, this);
   }
   return this._myView;
}; // getView()

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
   let embeddedTag;
   let newNode;
   let loadedAttributes;
   let loadedTags;
   let numEmbeddedTags;
   let richContent;
   let richContentType;
   let linkTarget;
   let tagName;
   let unexpectedAttributes;
   let unexpectedTags;

   //-----------------------------------------------------------------------
   // Process our XML
   //-----------------------------------------------------------------------
   [loadedAttributes, unexpectedAttributes, loadedTags, unexpectedTags] =
      loadXml(element, ATTRIBUTE_DEFAULTS, EXPECTED_EMBEDDED_TAGS);

   //-----------------------------------------------------------------------
   // Load our attributes
   //-----------------------------------------------------------------------
   this._backgroundColor = loadedAttributes.get("BACKGROUND_COLOR");
   this._created = loadedAttributes.get("CREATED");
   this._textColor = loadedAttributes.get("COLOR");

   if (loadedAttributes.get("FOLDED") === "true") {
      this._isFolded = true;
   } else {
      this._isFolded = false;
   }

   this._id = loadedAttributes.get("ID");
   this._modified = loadedAttributes.get("MODIFIED");
   this._position = loadedAttributes.get("POSITION");

   this._text = loadedAttributes.get("TEXT").split('\n');

   this._unexpectedAttributes = unexpectedAttributes;

   m3App.getDiagnostics().log(Diagnostics.TASK_IMPORT_XML,
                              "Created node: " + this._text);

   //-----------------------------------------------------------------------
   // Load embedded tags
   //---------------------------------------------------------------------
   numEmbeddedTags = loadedTags.length;

   for (i=0; i<numEmbeddedTags; i++) {
      embeddedTag = loadedTags[i];

      tagName = embeddedTag.tagName;

      if (tagName === "node") {
         newNode = new NodeModel(this._controller,
                                 this._myMapModel, NodeModel.TYPE_XML, this,
                                 "", embeddedTag);

         this._children.push(newNode);

      } else if (tagName === "arrowlink") {
         arrowLink = new ArrowLink();
         arrowLink.loadFromXml1_0_1(embeddedTag);
         this._arrowLinks.push(arrowLink);

      } else if (tagName === "cloud") {
         this._cloudModel = new CloudModel();
         this._cloudModel.loadFromXml1_0_1(embeddedTag);

      } else if (tagName === "font") {
         this._font = new Font();
         this._font.loadFromXml1_0_1(embeddedTag);

      } else if (tagName === "linktarget") {
         linkTarget = new LinkTarget();
         linkTarget.loadFromXml1_0_1(embeddedTag);
         this._linkTargets.push(linkTarget);

      } else if (tagName === "richcontent") {
         richContent = new RichContent();
         richContent.loadFromXml1_0_1(embeddedTag);
         richContentType = richContent.getType();

         if (richContentType === "NODE") {
            this._richText = richContent;
         } else if (richContentType === "NOTE") {
            this._note = richContent;
         } else {
            m3App.getDiagnostics().warn(Diagnostics.TASK_IMPORT_XML,
               "<node>: Unexpected type of richcontent: " +
               richContent.getType());
         }
      }
   }
   this._unexpectedTags = unexpectedTags;
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
