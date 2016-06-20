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
import {EditNodeDialog} from "./EditNodeDialog";
import {m3App} from "./main";
import {State} from "./State";

/**
 * This object handles all events related to the current map that do not
 * interact with the Map Model (e.g. scrolling, examining current state to
 * see if event should be passed to the Controller)
 *
 * @constructor
 * @param {Controller} controller - The controller for this app
 */
export function MapViewController(controller) {
   this._controller = controller;

   this._state = {state: MapViewController._STATE_IDLE,
                  selectedNodeView: null,
                  currentTranslationX: 0,
                  currentTranslationY: 0,
                  lastScreenX: null,
                  lastScreenY: null};

   this._svgGElement = document.getElementById("svg-g-element");
   m3App.getDiagnostics().log(Diagnostics.TASK_VIEWS, "Creating MapView.");

   //--------------------------------------------------------------------------
   // Reset stuff from previous map
   //--------------------------------------------------------------------------
   this._svgGElement.setAttribute("transform", "translate(0,0)");

   //--------------------------------------------------------------------------
   // Buttons
   //--------------------------------------------------------------------------
   document.getElementById("add-child").addEventListener("click",
      () => this.addChildClicked());

   document.getElementById("add-sibling").addEventListener("click",
      () => this.addSiblingClicked());

   document.getElementById('cloud').addEventListener("click",
      () => this.toggleCloudClicked());

   document.getElementById("delete-node").addEventListener("click",
      () => this.deleteNodeClicked());

   document.getElementById("edit-node").addEventListener("click",
      () => this.editNodeClicked());

   //--------------------------------------------------------------------------
   // Mouse Events
   //--------------------------------------------------------------------------
   document.getElementById("app-drawing-area").addEventListener("mousedown",
      (e) => this._mouseDown(e));

   document.getElementById("app-drawing-area").addEventListener("mouseup",
      (e) => this._mouseUp(e));

   document.getElementById("app-drawing-area").addEventListener("mousemove",
      (e) => this._mouseMove(e));

   //--------------------------------------------------------------------------
   // Touch Events
   //--------------------------------------------------------------------------
   document.getElementById("app-drawing-area").addEventListener("touchstart",
      (e) => this._touchStart(e));

   document.getElementById("app-drawing-area").addEventListener("touchend",
      (e) => this._touchEnd(e));

   document.getElementById("app-drawing-area").addEventListener("touchmove",
      (e) => this._touchMove(e));

} // MapViewController()

MapViewController._STATE_IDLE                  = "Idle";
MapViewController._STATE_MOUSE_DOWN_ON_MAP     = "Mouse Down On Map";
MapViewController._STATE_MOUSE_DRAGGING        = "Mouse Dragging";
MapViewController._STATE_NODE_SELECTED         = "Node Selected";
MapViewController._STATE_ONE_TOUCH_DRAGGING    = "One Touch Dragging";
MapViewController._STATE_ONE_TOUCH_ON_MAP      = "One Touch On Map";

/**
 * Add a child to the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.addChildClicked = function addChildClicked() {
   let editNodeDialog;
   let parentModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === MapViewController._STATE_NODE_SELECTED) {

         this._controller.addChild(this._state.selectedNodeView.getModel());
   }
}; // addChildClicked()

/**
 * Add a sibling after the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.addSiblingClicked = function addSiblingClicked() {
   let editNodeDialog;
   let parentModel;
   let selectedModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === MapViewController._STATE_NODE_SELECTED) {

         selectedModel = this._state.selectedNodeView.getModel();
         parentModel = selectedModel.getParent();

         this._controller.addChildAfter(parentModel, selectedModel);
   }
}; // addSiblingClicked()

/**
 * Delete the currently selected node, unless it's a root
 *
 * @return {void}
 */
MapViewController.prototype.deleteNodeClicked = function deleteNodeClicked() {
   let selectedModel;
   let parentModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === MapViewController._STATE_NODE_SELECTED) {

         selectedModel = this._state.selectedNodeView.getModel();
         parentModel = selectedModel.getParent();

         if (parentModel !== null) {
            this._controller.deleteNode(selectedModel);
            // Update state
            this._state.state = MapViewController._STATE_IDLE;
         }
   }
}; // deleteNode()

/**
 * Edit the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.editNodeClicked = function editNodeClicked() {
   let editNodeDialog;
   let selectedModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === MapViewController._STATE_NODE_SELECTED) {

         editNodeDialog = new EditNodeDialog(this._controller,
            this._state.selectedNodeView.getModel());
   }
}; // editNodeClicked()

/**
 * Get the NodeView that is currently selected.
 * @return {NodeView} - the NodeView that is currently selected (possibly null)
 */
MapViewController.prototype.getSelectedNodeView =
   function getSelectedNodeView() {

   return this._state.selectedNodeView;
}; // getSelectedNodeView()

/**
 * Return the current horizontal translation of the drawing element
 *
 * @return {number} current horizontal translation
 */
MapViewController.prototype.getCurrentTranslationX =
   function getCurrentTranslationX() {

   return this._state.currentTranslationX;
}; // getCurrentTranslationX()

/**
 * Return the current vertical translation of the drawing element
 *
 * @return {number} current vertical translation
 */
MapViewController.prototype.getCurrentTranslationY =
   function getCurrentTranslationY() {

   return this._state.currentTranslationY;
}; // getCurrentTranslationY()

/**
 * Tell this MapViewController that a node was clicked.
 *
 * @param {NodeView} clickedNodeView - The NodeView object that was clicked
 * @return {void}
 */
MapViewController.prototype.nodeClicked =
   function nodeClicked(clickedNodeView) {

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {

      // If the selected node was clicked, then deselect it
      // Otherwise make the clicked node setSelected

      if (this._state.state === MapViewController._STATE_NODE_SELECTED &&
         this._state.selectedNodeView === clickedNodeView) {
            this._state.selectedNodeView.setSelected(false);
            this._state.selectedNodeView = null;
            this._state.state = MapViewController._STATE_IDLE;
         } else {
            this.setSelectedNodeView(clickedNodeView);
      }
   }
}; // nodeClicked()

/**
 * Reset the view of the current map (i.e. center it)
 *
 * @return {void}
 */
MapViewController.prototype.reset = function reset() {
   this._state.currentTranslationX = 0;
   this._state.currentTranslationY = 0;

   this._svgGElement.setAttribute("transform", "translate(0,0)");
}; // reset()

/**
 * Set the specified nodeview as being selected
 *
 * @param {NodeView} nodeView - the NodeView that should be set as selected
 * @return {void}
 */
MapViewController.prototype.setSelectedNodeView =
   function setSelectedNodeView(nodeView) {

   // If another node is currently selected, deselect first
   if (this._state.state === MapViewController._STATE_NODE_SELECTED &&
      nodeView !== this._state.selectedNodeView) {
         this._state.selectedNodeView.setSelected(false);
   }

   nodeView.setSelected(true);
   this._state.selectedNodeView = nodeView;
   this._state.state = MapViewController._STATE_NODE_SELECTED;
}; // setSelectedNodeView()

/**
 * Toggle a cloud for the selected node, unless it's a root
 *
 * @return {void}
 */
MapViewController.prototype.toggleCloudClicked = function toggleCloudClicked() {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {

      case MapViewController._STATE_NODE_SELECTED:
         this._controller.toggleCloud(this._state.selectedNodeView.getModel());

         break;

      default:
         // Nothing
      } // switch
   }
}; // toggleCloudClicked()

/**
 * Act on the mouse being pressed
 * @param {Event} e - the Event object corresponding to this mouse event
 * @return {void}
 */
MapViewController.prototype._mouseDown = function _mouseDown(e) {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_IDLE:     // Same as for STATE_NODE_SELECTED
      case MapViewController._STATE_NODE_SELECTED:
         this._state.lastScreenX = e.screenX;
         this._state.lastScreenY = e.screenY;

         // Update state
         this._state.state = MapViewController._STATE_MOUSE_DOWN_ON_MAP;

         break;

      default:
         // Nothing
      } // switch
   }
}; // _mouseDown()

/**
 * Act on the mouse being moved
 * @param {Event} e - the Event object corresponding to this mouse move
 * @return {void}
 */
MapViewController.prototype._mouseMove = function _mouseMove(e) {
   let deltaX;
   let deltaY;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_MOUSE_DOWN_ON_MAP:
      case MapViewController._STATE_MOUSE_DRAGGING:
         deltaX = e.screenX - this._state.lastScreenX;
         deltaY = e.screenY - this._state.lastScreenY;

         this._state.currentTranslationX += deltaX;
         this._state.currentTranslationY += deltaY;

         this._svgGElement.setAttribute("transform", "translate(" +
                                        this._state.currentTranslationX + "," +
                                        this._state.currentTranslationY + ")");
         // Update state
         this._state.lastScreenX = e.screenX;
         this._state.lastScreenY = e.screenY;

         this._state.state = MapViewController._STATE_MOUSE_DRAGGING;

         break;

      default:
         // Nothing
      } // switch
   }
}; // _mouseMove()

/**
 * Act on the mouse button being release
 * @return {void}
 */
MapViewController.prototype._mouseUp = function _mouseUp() {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_MOUSE_DOWN_ON_MAP:
      case MapViewController._STATE_MOUSE_DRAGGING:

         // Update state
         if (this._state.selectedNodeView === null) {
            this._state.state = MapViewController._STATE_IDLE;
         } else {
            this._state.state = MapViewController._STATE_NODE_SELECTED;
         }
         break;

      default:
         // Nothing
      } // switch
   }
}; // _mouseUp()

/**
 * Act on a touch device being moved
 * @param {Event} e - the Event object associated with this move
 * @return {void}
 */
MapViewController.prototype._touchMove = function _touchMove(e) {
   let deltaX;
   let deltaY;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_ONE_TOUCH_ON_MAP:
      case MapViewController._STATE_ONE_TOUCH_DRAGGING:
         deltaX = e.changedTouches[0].screenX - this._state.lastScreenX;
         deltaY = e.changedTouches[0].screenY - this._state.lastScreenY;

         this._state.currentTranslationX += deltaX;
         this._state.currentTranslationY += deltaY;

         this._svgGElement.setAttribute("transform", "translate(" +
                                        this._state.currentTranslationX + "," +
                                        this._state.currentTranslationY + ")");
         // Update state
         this._state.lastScreenX = e.changedTouches[0].screenX;
         this._state.lastScreenY = e.changedTouches[0].screenY;
         this._state.state = MapViewController._STATE_ONE_TOUCH_DRAGGING;

         break;

      default:
         // Nothing
      } // switch
   }

   e.preventDefault();     // Prevent iOS annoying rubber band scrolling because
                           // there's no content to actually scroll
}; // _touchMove()

/**
 * Act on a touch event ending
 * @return {void}
 */
MapViewController.prototype._touchEnd = function _touchEnd() {

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_ONE_TOUCH_DRAGGING:
      case MapViewController._STATE_ONE_TOUCH_ON_MAP:

         // Update state
         if (this._state.selectedNodeView === null) {
            this._state.state = MapViewController._STATE_IDLE;
         } else {
            this._state.state = MapViewController._STATE_NODE_SELECTED;
         }
      } // switch
   }
}; // _touchEnd()

/**
 * Act on a touch event starting
 * @param {Event} e - the Event object associated with this touch
 * @return {void}
 */
MapViewController.prototype._touchStart = function _touchStart(e) {

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
      case MapViewController._STATE_IDLE:
      case MapViewController._STATE_NODE_SELECTED:

         // Update state
         this._state.lastScreenX = e.touches[0].screenX;
         this._state.lastScreenY = e.touches[0].screenY;
         this._state.state = MapViewController._STATE_ONE_TOUCH_ON_MAP;

         break;

      default:
         // Nothing
      } // switch
   }
}; // _touchStart()
