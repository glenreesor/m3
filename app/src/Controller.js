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

import {App} from './App';
import {AppButtons} from './AppButtons';
import {EditNodeDialog} from './EditNodeDialog';
import {ErrorDialog} from './ErrorDialog';
import {m3App} from './main';
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
   let initialMapUrl;

   this._appButtons = new AppButtons(this);
   this._mapViewController = new MapViewController(this);

   if (!m3App.showMapName()) {
      document.getElementById(
         `${App.HTML_ID_PREFIX}-top`
      ).style.display = 'none';
   }

   /*
    * Start with an empty map because a map specified to load on startup
    * doesn't get loaded until after the app is fully initialized
    */
   this.newMap(MapModel.TYPE_EMPTY, null, "New Map", null);

   initialMapUrl = m3App.getInitialMapUrl();
   if (initialMapUrl) {
      m3App.getMapFromUrl(
         initialMapUrl,
         function (mapContents) {
            this.newMap(
               MapModel.TYPE_XML,
               null,
               m3App.getInitialMapName(),
               mapContents
            );
         }.bind(this)
      );
   }
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
 * Delete all graphical links involving the specified node, recursively from
 * 'currentNode'.
 *
 * @param {NodeModel} nodeWithLink  The NodeModel whose corresponding graphical
 *                                  links need to be deleted.
 * @param {NodeModel} currentNode   The node whose ArrowLinks we're examining
 * @return {void}
 */
Controller.prototype.deleteGraphicalLinks = function deleteGraphicalLinks(
   nodeWithLink,
   currentNode
) {
   /*
    * Delete any graphical links of currentNode where nodeWithLink is source or
    * destination
    */
   currentNode.getArrowLinks().forEach( (arrowLink) => {
      if (
         nodeWithLink === currentNode ||
         nodeWithLink === arrowLink.getDestinationNode()
      ) {
         if (arrowLink.hasView()) {
            arrowLink.getView().deleteSvg();
         }
      }

   });

   /*
    * Delete any graphical links of descendants, where nodeWithLink is source or
    * destination
    */
   currentNode.getChildren().forEach( (child) => {
      this.deleteGraphicalLinks(nodeWithLink, child);
   });
};

/**
 * Delete the specified node from its parent
 *
 * @param {NodeModel} nodeToDelete - the node to be deleted
 * @return {void}
 */
Controller.prototype.deleteNode = function deleteNode(nodeToDelete) {
   let parent;
   //--------------------------------------------------------------------------
   // Delete any graphical links involving this node
   //--------------------------------------------------------------------------
   this.deleteGraphicalLinks(nodeToDelete, this._mapModel.getRoot());

   //--------------------------------------------------------------------------
   // Delete any graphical links involving any descendants of this node,
   // because those nodes are being deleted as well
   //--------------------------------------------------------------------------
   nodeToDelete.getDescendants().forEach( (child) => {
      this.deleteGraphicalLinks(child, this._mapModel.getRoot());
   });

   //--------------------------------------------------------------------------
   // Update the model
   //--------------------------------------------------------------------------
   parent = nodeToDelete.getParent();
   parent.deleteChild(nodeToDelete);

   //--------------------------------------------------------------------------
   // Update the view
   //--------------------------------------------------------------------------
   this._deleteView(nodeToDelete);
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

   // Delete all svg elements and listeners
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
 * Abandon current map if there is one (model and views) and create a new one
 *
 * @param {String} type - One of MapModel.TYPE_{EMPTY, XML}
 * @param {String} dbKey - The key this is saved under (null if not saved)
 * @param {String} mapName - The name of this map
 * @param {String[]} xml - Array of xml strings that make up the map
 * @return {void}
 */
Controller.prototype.newMap = function newMap(type, dbKey, mapName, xml) {
   let root;

   if (this._mapModel) {
      root = this._mapModel.getRoot();

      // Delete all graphical links for all nodes in this map
      root.getDescendants().forEach( (node) => {
         // Delete all links involving this node
         this.deleteGraphicalLinks(node, root);
      });
      this._deleteView(this._mapModel.getRoot());  // Recursively delete
   }

   this._mapModel = new MapModel(this, type, dbKey, mapName, xml);
   this._rootNodeView = this._mapModel.getRoot().getView();
   this._mapViewController.reset();
   this.redrawMain();

   /*
    * Positioning of the map is done asynchronously, so hide the root svg so we
    * don't get a flash. Visibility style doesn't work on svg, and setting
    * visibility to hidden on parent div doesn't affect the svg :-(
    */
   document.getElementById(
      `${App.HTML_ID_PREFIX}-svg-element`
   ).style.opacity = 0;

   this.selectRootNode();
}; // newMap()

/**
 * Select and position the root node of the current map.
 * Root node will be:
 *   - Centered if it has children on both sides
 *   - Left-aligned if it has no children or only children on the right side
 *   - Right-aligned if it only has children on the left side
 *
 * @return {void}
 */
Controller.prototype.selectRootNode = function selectRootNode() {
   /*
    * Sometimes we're called when a dialog is open, so we need
    * to let the dialog close first, otherwise nodeClicked() won't
    * do anything.
    */
   let timeout = setTimeout(() => {
      this._mapViewController.nodeClicked(this._rootNodeView);
      this._mapViewController.positionSelectedNodeOptimally();
      document.getElementById(
         `${App.HTML_ID_PREFIX}-svg-element`
      ).style.opacity = 1;
   }, 0);
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
   function setModifiedIndicator(status
) {

   /*
    * Don't show the indicator if we're readonly, because even
    * though it's readonly, changing the folding status changes
    * the map, thus affects it's changed status
    */
   if (status && !m3App.isReadOnly()) {
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
Controller.prototype.redrawGraphicalLinks = function redrawGraphicalLinks(
   nodeModel
) {

   // Draw the graphical links for the specified node
   nodeModel.getArrowLinks().forEach( (arrowLink) => {
      let destNode;
      let oneEndHidden;
      let srcNode;

      oneEndHidden = false;
      /*
       * Since the source or destination nodes may be hidden, we determine
       * the closest source/destination ancestors that are not hidden.
       */

      srcNode = nodeModel;
      while (!srcNode.getView().isVisible()) {
         oneEndHidden = true;
         srcNode = srcNode.getParent();
      }

      destNode = arrowLink.getDestinationNode();
      while (!destNode.getView().isVisible()
      ) {
         oneEndHidden = true;
         destNode = destNode.getParent();
      }

      if (srcNode !== destNode) {
         // Draw it if we're not trying to draw from/to the exact same node
         arrowLink.getView().draw(
            srcNode.getView(),
            destNode.getView(),
            oneEndHidden
         );
      } else {
         // Don't draw it, and hide if it has already been drawn
         if (arrowLink.hasView()) {
            arrowLink.getView().setVisible(false);
         }
      }
   });

   /*
    * Draw the graphical links for all children of this node.
    * Since we draw arrows from/to the closest visible ancestors, we process
    * all nodes, even ones that are not visible
    */
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
