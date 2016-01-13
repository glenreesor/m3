"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License, version 3, as published by
// the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Mobile Mind Mapper.  If not, see <http://www.gnu.org/licenses/>.

import {AppButtons} from "./AppButtons";
import {EditNodeDialog} from "./EditNodeDialog";
import {MapModel} from "./MapModel";
import {MapViewController} from "./MapViewController";
import {NodeView} from "./NodeView";
/**
 * This is the controller that handles actions/events that interact with the model.
 * Events that do not interact with the model (e.g. scrolling) are handled by
 * MapViewController
 *
 * @constructor
 */
export function Controller() {
   this._nodeViews = new Map();

   this._appButtons = new AppButtons(this);
   this._mapModel = new MapModel(this, MapModel.TYPE_EMPTY, null, "New Map", null);
   this._mapViewController = new MapViewController(this);

   this.createNodeView(this._mapModel.getRoot());
   this.redrawMain();
} // controller()

/**
 * Add a child to the specified node
 * @param {NodeModel} parent - The node that will get a new child
 * @return {void}
 */
Controller.prototype.addChild = function addChild(parent) {
   let child;
   let editNodeDialog;

   //--------------------------------------------------------------------------
   // Update the model
   //    - Add the child with default text
   //--------------------------------------------------------------------------
   child = parent.addChild("New Node");

   //--------------------------------------------------------------------------
   // Update the views
   //--------------------------------------------------------------------------
   this.getNodeView(parent).update();  // It might not have had a folding icon before
   this.createNodeView(child);
   this.redrawMain();


   // Allow user to edit the default text
   editNodeDialog = new EditNodeDialog(this, child);

}; // addChild()

/**
 * Add a child to the specified node, after the specified child
 *
 * @param {NodeModel} parent - The node that will get a new child
 * @param {NodeModel} relativeChild - The child after which a new one will be added
 * @return {void}
 */
Controller.prototype.addChildAfter = function addChildAfter(parent, relativeChild) {
   let child;
   let editNodeDialog;

   //--------------------------------------------------------------------------
   // Update the model
   //    - Add the child with default text
   //--------------------------------------------------------------------------
   child = parent.addChildAfter(relativeChild, "New Node");
   this.createNodeView(child);
   this.redrawMain();

   // Allow user to edit the default text. EditNodeDialog handles telling
   // the view to redraw itself
   editNodeDialog = new EditNodeDialog(this, child);

}; // addChildAfter()

/**
 * Change the text for the specified node
 *
 * @param {NodeModel} node - The node whose text will be changed
 * @param {String} text - The new text
 * @return {void}
 */
Controller.prototype.changeNodeText = function changeNodeText(node, text) {
   //--------------------------------------------------------------------------
   // Update the model
   //--------------------------------------------------------------------------
   node.setText(text);

   //--------------------------------------------------------------------------
   // Update the view
   //--------------------------------------------------------------------------
   this.getNodeView(node).update();
   this.redrawMain();
}; // changeNodeText()

/**
 * Create a nodeView for the specified NodeModel
 *
 * @param {NodeModel} nodeModel - the NodeModel that needs a view created
 * @return {NodeView} - the new NodeView
 */
Controller.prototype.createNodeView = function createNodeView(nodeModel) {
   let newNodeView;

   newNodeView = new NodeView(this, nodeModel);
   this._nodeViews.set(nodeModel.getId(), newNodeView);

   return newNodeView;
}; // createNodeView()

/**
 * Delete the specified node from the specified parent
 *
 * @param {NodeModel} node - the node to be deleted
 * @return {void}
 */
Controller.prototype.deleteNode = function deleteNode(node) {
   let parent;
   //--------------------------------------------------------------------------
   // Update the model
   //--------------------------------------------------------------------------
   parent = node.getParent();
   parent.deleteChild(node);

   //--------------------------------------------------------------------------
   // Update the views
   //--------------------------------------------------------------------------
   this.getNodeView(parent).update();
   this._deleteView(node);
   this.redrawMain();
}; // deleteNode()

/**
 * Delete the specified view (and all child views)
 *
 * @param {NodeModel} node - The NodeModel whose view is to be deleted
 * @return {void}
 */
Controller.prototype._deleteView = function _deleteView(node) {
   // Delete all child views of specified node
   node.getChildren().forEach((child) => {
      this._deleteView(child);
   });

   // Delete the specified node
   this.getNodeView(node).deleteMyself();    // Deletes all svg elements and listeners
   this._nodeViews.delete(node.getId());
}; // _deleteView()

/**
 * Return the current mapModel.
 * Note: While a new model is being loaded, this method will return the old model
 *
 * @return {MapModel} - the mapModel this controller is associated with.
 */
Controller.prototype.getMapModel = function getMapModel() {
   return this._mapModel;
}; // getMapModel()

/**
 * Return the mapViewController
 *
 * @return {MapViewController} - the mapView this controller is controlling
 */
Controller.prototype.getMapViewController = function getMapViewController() {
   return this._mapViewController;
}; // getMapViewController()

/**
 * Get the view for the specified model. If it doesn't exist, create it
 *
 * @param {NodeModel} nodeModel - The NodeModel whose corresponding NodeView is to be returned
 * @return {NodeView} - The newly created NodeView
 */
Controller.prototype.getNodeView = function getNodeView(nodeModel) {
   let nodeView;

   nodeView = this._nodeViews.get(nodeModel.getId());
   if (nodeView === undefined) {
      nodeView = this.createNodeView(nodeModel);
   }

   return nodeView;
}; // getNodeView()

/**
 * Abandon current map (model and views) and create a new one
 *
 * @param {String} type - One of MapModel.TYPE_{EMPTY, XML}
 * @param {String} dbKey - The key this is saved under (null if not saved)
 * @param {String} mapName - The name of this map
 * @param {String[]} xml - Array of xml strings that make up the map
 * @return {void}
 */
Controller.prototype.newMap = function newMap(type, dbKey, mapName, xml) {
   this._deleteView(this._mapModel.getRoot());   // This recursively deletes all nodes
   this._mapModel = new MapModel(this, type, dbKey, mapName, xml);
   this.createNodeView(this._mapModel.getRoot());
   this.redrawMain();
}; // newMap()

/**
  * Set the modified indicator of this map.
  *
  * @param {boolean} status - Either false (unmodified) or true (modified/unsaved)
  * @return {void}
  */
Controller.prototype.setModifiedIndicator = function setModifiedIndicator(status) {
   if (status) {
      document.getElementById("modified").removeAttribute("hidden");
   } else {
      document.getElementById("modified").setAttribute("hidden", "true");
   }
}; // setModifiedStatus()

/**
 * Toggle the cloud for the specified node
 *
 * @param {node} node - The node whose cloud has been toggled
 * @return {void}
 */
Controller.prototype.toggleCloud = function toggleCloud(node) {
   //--------------------------------------------------------------------------
   // Update the model
   //--------------------------------------------------------------------------
   node.toggleCloud();

   //--------------------------------------------------------------------------
   // Update the view
   //--------------------------------------------------------------------------
   this.getNodeView(node).update();
   this.redrawMain();
}; // toggleCloud()

/**
 * Toggle the folded status of the specified node
 *
 * @param {node} node - The node that has been folded/unfolded
 * @return {void}
 */
Controller.prototype.toggleFoldedStatus = function toggleFoldedStatus(node) {
   //--------------------------------------------------------------------------
   // Update the model
   //--------------------------------------------------------------------------
   node.toggleFoldedStatus();

   //--------------------------------------------------------------------------
   // Update the view
   //--------------------------------------------------------------------------
   this.getNodeView(node).update();
   this.redrawMain();
}; // toggleFoldedStatus()

/**
 * Draw the graphical links associated with the specified node. Then draw for
 * this node's children.
 *
 * @param {NodeModel} nodeModel - The node whose graphical links should be drawn
 * @return {void}
 */
Controller.prototype.redrawGraphicalLinks = function redrawGraphicalLinks(nodeModel) {
   // Draw the graphical links for the specified node
   this.getNodeView(nodeModel).drawGraphicalLinks();

   // Draw the graphical links for all children of this node
   nodeModel.getChildren().forEach( (child) => {
      this.redrawGraphicalLinks(child);
   });
}; // redrawGraphicalLinks()

/**
 * Redraw the map because something has changed
 *
 * @return {void}
 */
Controller.prototype.redrawMain = function redrawMain() {
   this.getNodeView(this._mapModel.getRoot()).calcDimensions();
   this.getNodeView(this._mapModel.getRoot()).drawAt(100, 200, null, null);
   this.redrawGraphicalLinks(this._mapModel.getRoot());
}; // redraw()
