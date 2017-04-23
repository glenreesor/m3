"use strict";

// Copyright 2015-2017 Glen Reesor
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

import {ArrowLink} from './ArrowLink';
import {CloudModel} from './CloudModel';
import {Diagnostics} from './Diagnostics';
import {Font} from './Font';
import {IconModel} from './IconModel';
import {LinkTarget} from './LinkTarget';
import {createXml, loadXml} from './xmlHelpers';
import {NodeView} from './NodeView';
import {RichContent} from './RichContent';
import {m3App} from './main';

const ATTRIBUTE_DEFAULTS = new Map([['BACKGROUND_COLOR', ''],
                                    ['CREATED', ''],
                                    ['COLOR', '#000000'],
                                    ['FOLDED', 'false'],
                                    ['ID', ''],
                                    ['LINK', ''],
                                    ['MODIFIED', ''],
                                    ['POSITION', ''],
                                    ['TEXT', '']
                                 ]);

const EXPECTED_EMBEDDED_TAGS = ['arrowlink', 'cloud', 'font', 'icon',
                                'linktarget', 'node', 'richcontent'];

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
   this._backgroundColor = '';    // No color means transparent
   this._children = [];
   this._cloudModel = null;
   this._font = null;             // Points to Font object
   this._icons = [];              // Points to IconModel objects
   this._isFolded = false;
   this._link = null;
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

/**
 * Take the specified string and escape all special characters using &
 * Special chars are: & < > " '
 *
 * @param {string} text - Text to be escaped
 *
 * @return {string} - The escaped text
 */
NodeModel.escapeSpecialChars = function(text) {
   let escapedText;

   escapedText = text.replace(new RegExp("&", "g"), "&amp;");
   escapedText = escapedText.replace(new RegExp("<", "g"), "&lt;");
   escapedText = escapedText.replace(new RegExp(">", "g"), "&gt;");
   escapedText = escapedText.replace(new RegExp('"', "g"), "&quot;");
   escapedText = escapedText.replace(new RegExp("'", "g"), "&apos;");

   return escapedText;
}; // escapeSpecialChars()

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
   let allLines;
   let attributes;
   let embeddedTags;
   let i;
   let escapedText;
   let tempText;           // Used for removing special XML characters
   let xml = [];

   attributes = new Map();

   //-------------------------------------------------------------------------
   // Load up attributes
   //-------------------------------------------------------------------------
   attributes.set("BACKGROUND_COLOR", this._backgroundColor);
   attributes.set("COLOR", this._textColor);
   attributes.set("CREATED", this._created);

   if (this._isFolded === true) {
      attributes.set("FOLDED", "true");
   } else {
      attributes.set("FOLDED", "false");
   }

   attributes.set("ID", this._id);

   // Escape special characters in Link
   if (this._link !== null) {
      attributes.set('LINK', NodeModel.escapeSpecialChars(this._link));
   }

   attributes.set("MODIFIED", this._modified);

   // Only save the position for children of the root
   if (this._parent !== null && this._parent.getParent() === null) {
      attributes.set("POSITION", this._position);
   } else {
      attributes.set("POSITION", ATTRIBUTE_DEFAULTS.get("POSITION"));
   }

   if (this._text !== null) {
      allLines = '';

      // Loop through each line of text, adding an escaped newline character
      // where required.
      this._text.forEach( function(line, index) {
         escapedText = NodeModel.escapeSpecialChars(line);

         if (index !== 0) {
            allLines += '&#xa;' + escapedText;
         } else {
            allLines = escapedText;
         }
      });
      attributes.set("TEXT", allLines);
   }

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

   this._icons.forEach( (icon) => {
      embeddedTags.push(icon);
   });

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
 * Return the child after the specified node. Null if there isn't one.
 * If this node is root, the returned node will be on the same side as the
 * specified child.
 *
 * @param {NodeModel} referenceChild - The reference child
 * @return {NodeModel} The child after the specified one
 */

NodeModel.prototype.getChildAfter = function getChildAfter(referenceChild) {
   let childAfter;
   let indexAfter;
   let requiredSide;

   indexAfter = this._children.indexOf(referenceChild) + 1;
   childAfter = null;

   if (this._parent !== null) {
      // We're not the root, so no special logic
      if (indexAfter < this._children.length) {
         childAfter = this._children[indexAfter];
      }
   } else {
      // We're the root note, so make sure the returned node is
      // on the same side as the reference node
      requiredSide = referenceChild.getSide();

      while (childAfter === null && indexAfter < this._children.length) {
         if (this._children[indexAfter].getSide() === requiredSide) {
            childAfter = this._children[indexAfter];
         }
         indexAfter++;
      }
   }

   return childAfter;
}; // getChildAfter()

/**
 * Return the child before the specified node. Null if there isn't one.
 * If this node is root, the returned node will be on the same side as the
 * specified child.
 *
 * @param {NodeModel} referenceChild - The reference child
 * @return {NodeModel} The child before the specified one
 */

NodeModel.prototype.getChildBefore = function getChildBefore(referenceChild) {
   let childBefore;
   let indexBefore;
   let requiredSide;

   indexBefore = this._children.indexOf(referenceChild) - 1;
   childBefore = null;

   if (this._parent !== null) {
      // We're not the root, so no special logic
      if (indexBefore >= 0) {
         childBefore = this._children[indexBefore];
      }
   } else {
      // We're the root note, so make sure the returned node is
      // on the same side as the reference node

      requiredSide = referenceChild.getSide();

      while (childBefore === null && indexBefore >= 0) {
         if (this._children[indexBefore].getSide() === requiredSide) {
            childBefore = this._children[indexBefore];
         }
         indexBefore--;
      }
   }

   return childBefore;
}; // getChildBefore()

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
 * Return the first child on the specified side. Null if there isn't one.
 * @param  {string} side - The required side
 * @return {NodeModel}   - The first child node on the specified side
 */
NodeModel.prototype.getFirstChild = function getFirstChild(side) {
   let i;
   let returnValue;

   returnValue = null;

   i = 0;
   while (returnValue === null && i < this._children.length) {
      if (this._children[i].getSide() === side) {
         returnValue = this._children[i];
      }
      i++;
   }

   return returnValue;
}; // getFirstChild()

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
 * Return the icons of this node
 * @return {IconModel[]} - This node's IconModel(s)
 */
NodeModel.prototype.getIcons = function getIcons() {
   return this._icons;
}; // getIcons()

/**
 *
 * Return the ID of this node
 * @return {String} - This node's ID
 */
NodeModel.prototype.getId = function getId() {
   return this._id;
}; // getId()

/**
 * Return the last child on the specified side. Null if there isn't one.
 * @param  {string} side - The required side
 * @return {NodeModel}   - The last child node on the specified side
 */
NodeModel.prototype.getLastChild = function getLastChild(side) {
   let i;
   let returnValue;

   returnValue = null;

   i = this._children.length - 1;
   while (returnValue === null && i >= 0) {
      if (this._children[i].getSide() === side) {
         returnValue = this._children[i];
      }
      i--;
   }

   return returnValue;
}; // getLastChild()

/**
 * Return the link text for this node
 * @return {string} - This node's link text (null if there isn't any)
 *
 */
NodeModel.prototype.getLink = function getLink() {
   return this._link;
}; // getLink()

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
   let icon;
   let loadedAttributes;
   let loadedTags;
   let newNode;
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

   // We only keep a record of the link if it's not blank
   this._link = loadedAttributes.get('LINK');
   if (this._link === '') {
      this._link = null;
   }

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

      } else if (tagName === 'icon') {
         icon = new IconModel();
         icon.loadFromXml1_0_1(embeddedTag);
         this._icons.push(icon);

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
 * Move the specified child down in the child order. If it's the last node,
 * it will wrap around to the first node.
 *
 * @param {NodeModel} childToMove - the child to be moved
 * @return {void}
 */
NodeModel.prototype.moveChildDown = function moveChildDown(childToMove) {
   let indexOfChildToMove;
   let indexOfNextChild;
   let nextChild;

   if (this._children.length === 1) {
      return;
   }

   indexOfChildToMove = this._children.indexOf(childToMove);

   if (this._parent !== null) {
      // We're not the root note, so no special logic about sides is required

      if (indexOfChildToMove !== (this._children.length - 1)) {
         // We're not the last child, so just switch with the next one
         nextChild = this._children[indexOfChildToMove + 1];
         this._children[indexOfChildToMove] = nextChild;
         this._children[indexOfChildToMove + 1] = childToMove;

      } else {
         // Last child is special--it needs to wrap around.
         // Delete it and insert as first
         this._children.pop();
         this._children.unshift(childToMove);

      }
   } else {
      // We're the root node, so must move down relative to other nodes
      // on the same side.

      // Find next child on the same side
      nextChild = this.getChildAfter(childToMove);

      if (nextChild !== null) {
         // We found the next child on same side, so switch with childToMove

         // Next child on same side may not be immediately after childtoMove,
         // thus can't just use indexOfChildToMove + 1
         indexOfNextChild = this._children.indexOf(nextChild);

         this._children[indexOfChildToMove] = nextChild;
         this._children[indexOfNextChild] = childToMove;

      } else {
         // We didn't find a next child on the same side.
         // We only have to do something if we're not the only child on this
         // side
         nextChild = this.getFirstChild(childToMove.getSide());
         if (nextChild !== childToMove) {

            // Last child on a side is special--it needs to wrap around.
            // Delete it and insert as first
            this._children.splice(indexOfChildToMove, 1);
            this._children.unshift(childToMove);
         }
      }
   }
}; // moveChildDown()

/**
 * Move the specified child up in the child order. If it's the first node,
 * it will wrap around to the last node.
 *
 * @param {NodeModel} childToMove - the child to be moved
 * @return {void}
 */
NodeModel.prototype.moveChildUp = function moveChildUp(childToMove) {
   let indexOfChildToMove;
   let indexOfPreviousChild;
   let previousChild;

   if (this._children.length === 1) {
      return;
   }

   indexOfChildToMove = this._children.indexOf(childToMove);

   if (this._parent !== null) {
      // We're not the root note, so no special logic about sides is required

      if (indexOfChildToMove !== 0) {
         // We're not the first child, so just switch with the previous one
         previousChild = this._children[indexOfChildToMove - 1];
         this._children[indexOfChildToMove - 1] = childToMove;
         this._children[indexOfChildToMove] = previousChild;

      } else {
         // First child is special--it needs to wrap around.
         // Delete it and add as last
         this._children.shift();
         this._children.push(childToMove);

      }
   } else {
      // We're the root node, so must move up relative to other nodes on the
      // same side

      // Find previous child on the same side
      previousChild = this.getChildBefore(childToMove);

      if (previousChild !== null) {
         // We found the previous child on the same side, so switch with
         // childtoMove

         // Previous child on same side may not be immediately before
         // childToMove, thus can't just use indexOfChildToMove - 1
         indexOfPreviousChild = this._children.indexOf(previousChild);

         this._children[indexOfChildToMove] = previousChild;
         this._children[indexOfPreviousChild] = childToMove;

      } else {
         // We didn't find a previous child on the same side.
         // We only have to do something if we're not the only child on this
         // side
         previousChild = this.getLastChild(childToMove.getSide());
         if (previousChild !== childToMove) {

            // First child on a side is special--it needs to wrap around.
            // Delete it and add as last.
            this._children.splice(indexOfChildToMove, 1);
            this._children.push(childToMove);
         }
      }
   }
}; // moveChildUp()

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
