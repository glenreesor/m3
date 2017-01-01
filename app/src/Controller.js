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

import {App} from './App';
import {AppButtons} from './AppButtons';
import {EditNodeDialog} from './EditNodeDialog';
import {MapModel} from './MapModel';
import {MapViewController} from './MapViewController';
import {NodeView} from './NodeView';

/**
 * This is the controller that handles actions/events that interact with the
 * model. Events that do not interact with the model (e.g. scrolling) are
 * handled by MapViewController
 *
 * @constructor
 */
export function Controller() {
   this._appButtons = new AppButtons(this);
   this._mapModel = new MapModel(this, MapModel.TYPE_EMPTY, null, "New Map",
                                 null);
   this._mapViewController = new MapViewController(this);
   this._rootNodeView = this._mapModel.getRoot().getView();
   this.selectRootNode();
   this.redrawMain();
   this._mapViewController.centerSelectedNode();
} // Controller()

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
   child = parent.addChild(["New Node"]);

   //--------------------------------------------------------------------------
   // Update the views
   //--------------------------------------------------------------------------

   // It might not have had a folding icon before
   parent.getView().update();
   this.redrawMain();


   // Allow user to edit the default text
   editNodeDialog = new EditNodeDialog(this, child, null);

}; // addChild()

/**
 * Add a child to the specified node, after the specified child
 *
 * @param {NodeModel} parent - The node that will get a new child
 * @param {NodeModel} relativeChild - The child after which a new one will be
 *                                    added
 * @return {void}
 */
Controller.prototype.addChildAfter = function addChildAfter(parent,
                                                            relativeChild) {
   let child;
   let editNodeDialog;

   //--------------------------------------------------------------------------
   // Update the model
   //    - Add the child with default text
   //--------------------------------------------------------------------------
   child = parent.addChildAfter(relativeChild, ["New Node"]);
   this.redrawMain();

   // Allow user to edit the default text. EditNodeDialog handles telling
   // the view to redraw itself
   editNodeDialog = new EditNodeDialog(this, child, null);

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
   node.getView().update();
   this.redrawMain();
}; // changeNodeText()

/**
 * Delete the specified node from its parent
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
   // Update the view
   //--------------------------------------------------------------------------
   this._deleteView(node);
   parent.getView().update();
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

   // Deletes all svg elements and listeners
   node.getView().deleteMyself();
}; // _deleteView()


/**
 * Return the current mapModel.
 * Note: While a new model is being loaded, this method will return the old
 *       model
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
 * Move the specified node down in the child list
 *
 * @param {NodeModel} child The node to move down
 *
 * @return {void}
 */
Controller.prototype.moveNodeDown = function moveNodeDown(child) {
   let parent;

   parent = child.getParent();

   if (parent !== null) {
      parent.moveChildDown(child);
      this.redrawMain();
   }
}; // moveNodeUp()
/**
 * Move the specified node up in the child list
 *
 * @param {NodeModel} child The node to move up
 *
 * @return {void}
 */
Controller.prototype.moveNodeUp = function moveNodeUp(child) {
   let parent;

   parent = child.getParent();

   if (parent !== null) {
      parent.moveChildUp(child);
      this.redrawMain();
   }
}; // moveNodeUp()

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
   this._deleteView(this._mapModel.getRoot());  // Recursively delete all nodes
   this._mapModel = new MapModel(this, type, dbKey, mapName, xml);
   this._rootNodeView = this._mapModel.getRoot().getView();
   this._mapViewController.reset();
   this.redrawMain();
   this._mapViewController.centerSelectedNode();
}; // newMap()

/**
  * Select the root node of the current map
  * @return {void}
  */
Controller.prototype.selectRootNode = function selectRootNode() {
   this._mapViewController.nodeClicked(this._rootNodeView);
}; // selectRootNode()

/**
  * Set the name of this map in UI
  * @param {String} name - This map's name
  * @return {void}
  */
Controller.prototype.setMapName = function setMapName(name) {
   document.getElementById(`${App.HTML_ID_PREFIX}-mapName`).innerHTML = name;
}; // setMapName()

/**
  * Set the modified indicator of this map.
  *
  * @param {boolean} status - Either false (unmodified) or true
  *                           (modified/unsaved)
  * @return {void}
  */
Controller.prototype.setModifiedIndicator =
   function setModifiedIndicator(status) {

   if (status) {
      document.getElementById(`${App.HTML_ID_PREFIX}-modified`)
              .removeAttribute("hidden");
   } else {
      document.getElementById(`${App.HTML_ID_PREFIX}-modified`)
              .setAttribute("hidden", "true");
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
   node.getView().update();
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
   node.getView().update();
   this.redrawMain();
}; // toggleFoldedStatus()

/**
 * Draw the graphical links associated with the specified node. Then draw for
 * this node's children.
 *
 * @param {NodeModel} nodeModel - The node whose graphical links should be drawn
 * @return {void}
 */
Controller.prototype.redrawGraphicalLinks =
   function redrawGraphicalLinks(nodeModel) {

   // Draw the graphical links for the specified node
   nodeModel.getView().drawGraphicalLinks();

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
   this._rootNodeView.calcDimensions();
   this._rootNodeView.drawAt(0, 0, null, null);
   this.redrawGraphicalLinks(this._mapModel.getRoot());
}; // redraw()
