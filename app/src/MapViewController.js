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

const STATE_IDLE                  = "Idle";
const STATE_MOUSE_DOWN_ON_MAP     = "Mouse Down On Map";
const STATE_MOUSE_DRAGGING        = "Mouse Dragging";
const STATE_NODE_SELECTED         = "Node Selected";
const STATE_ONE_TOUCH_DRAGGING    = "One Touch Dragging";
const STATE_ONE_TOUCH_ON_MAP      = "One Touch On Map";
const MOUSE_EVENT                 = "Mouse Event";
const TOUCH_EVENT                 = "Touch Event";

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

   this._state = {
      state: STATE_IDLE,
      selectedNodeView: null,
      scroll: {
         currentTranslationX: 0,
         currentTranslationY: 0,
         lastScreenX: null,
         lastScreenY: null,
         previousTime: 0,
         velocityX: 0,
         velocityY: 0
      }
   };

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

/**
 * Add a child to the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.addChildClicked = function addChildClicked() {
   let editNodeDialog;
   let parentModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === STATE_NODE_SELECTED) {

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
       this._state.state === STATE_NODE_SELECTED) {

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
       this._state.state === STATE_NODE_SELECTED) {

         selectedModel = this._state.selectedNodeView.getModel();
         parentModel = selectedModel.getParent();

         if (parentModel !== null) {
            this._controller.deleteNode(selectedModel);
            // Update state
            this._state.state = STATE_IDLE;
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
       this._state.state === STATE_NODE_SELECTED) {

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

   return this._state.scroll.currentTranslationX;
}; // getCurrentTranslationX()

/**
 * Return the current vertical translation of the drawing element
 *
 * @return {number} current vertical translation
 */
MapViewController.prototype.getCurrentTranslationY =
   function getCurrentTranslationY() {

   return this._state.scroll.currentTranslationY;
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

      if (this._state.state === STATE_NODE_SELECTED &&
         this._state.selectedNodeView === clickedNodeView) {
            this._state.selectedNodeView.setSelected(false);
            this._state.selectedNodeView = null;
            this._state.state = STATE_IDLE;
         } else {
            this.setSelectedNodeView(clickedNodeView);
      }
   }
}; // nodeClicked()

/**
 * Reset the translation of the current map to (0,0)
 *
 * @return {void}
 */
MapViewController.prototype.reset = function reset() {
   this._state.scroll.currentTranslationX = 0;
   this._state.scroll.currentTranslationY = 0;

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
   if (this._state.state === STATE_NODE_SELECTED &&
      nodeView !== this._state.selectedNodeView) {
         this._state.selectedNodeView.setSelected(false);
   }

   nodeView.setSelected(true);
   this._state.selectedNodeView = nodeView;
   this._state.state = STATE_NODE_SELECTED;
}; // setSelectedNodeView()

/**
 * Toggle a cloud for the selected node, unless it's a root
 *
 * @return {void}
 */
MapViewController.prototype.toggleCloudClicked = function toggleCloudClicked() {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_NODE_SELECTED:
            this._controller.toggleCloud(
               this._state.selectedNodeView.getModel()
            );

            break;

         default:
            // Nothing
      } // switch
   }
}; // toggleCloudClicked()

/**
 * Perform an automatic scroll to simulate inertia.
 *
 * @return {void}
 */
MapViewController.prototype._inertiaScroll = function _inertiaScroll() {
   let deltaT;
   let newX;
   let newY;
   let now;
   let oldX;
   let oldY;

   // Update timestamps so we can calculate velocity
   now = Date.now();
   deltaT = now - this._state.scroll.previousTime;
   this._state.scroll.previousTime = now;

   // Update positions
   oldX = this._state.scroll.currentTranslationX;
   oldY = this._state.scroll.currentTranslationY;

   newX = this._state.scroll.getInertiaScrollX();
   newY = this._state.scroll.getInertiaScrollY();

   this._state.scroll.currentTranslationX = newX;
   this._state.scroll.currentTranslationY = newY;

   // Do the move
   this._svgGElement.setAttribute( "transform", `translate(${newX}, ${newY})`);

   // Request another inertia scroll if velocity (pixels / millisecond) is
   // greater than a threshold
   if (
      Math.abs(oldX - newX) / deltaT > 0.01 ||
      Math.abs(oldY - newY) / deltaT > 0.01
   ) {
      window.requestAnimationFrame(this._inertiaScroll.bind(this));
   }
}; // _inertiaScroll();

/**
 * Handle a movement action when the mouse button is down or finger is moving
 *
 * @param {number} screenX - X-coordinate of mouse click / touch
 * @param {number} screenY - Y-coordinate of mouse click / touch
 *
 * @return {void}
 */
MapViewController.prototype._interactionMove = function _interactionMove(
   screenX,
   screenY
) {
   let deltaT;
   let deltaX;
   let deltaY;
   let newVx;
   let newVy;
   let newScreenX;
   let newScreenY;
   let now;

   //-------------------------------------------------------------------------
   // Calculate and record position information
   //-------------------------------------------------------------------------
   newScreenX = screenX;
   newScreenY = screenY;

   deltaX = newScreenX - this._state.scroll.lastScreenX;
   deltaY = newScreenY - this._state.scroll.lastScreenY;

   this._state.scroll.currentTranslationX += deltaX;
   this._state.scroll.currentTranslationY += deltaY;

   this._state.scroll.lastScreenX = newScreenX;
   this._state.scroll.lastScreenY = newScreenY;

   //-------------------------------------------------------------------------
   // Do the move
   //-------------------------------------------------------------------------
   this._svgGElement.setAttribute(
      "transform", `translate(${this._state.scroll.currentTranslationX}` +
                   `,${this._state.scroll.currentTranslationY})`);

   //-------------------------------------------------------------------------
   // Calculate new velocity (pixels / millisecond)
   // Make sure we don't get NaN or infinity velocities (Mobile Firefox likes
   // to do that)
   //-------------------------------------------------------------------------
   now = Date.now();
   deltaT = now - this._state.scroll.previousTime;
   this._state.scroll.previousTime = now;

   newVx = deltaT > 0 ? deltaX / deltaT : 0;
   newVy = deltaT > 0 ? deltaY / deltaT : 0;

   // NaN or Super high velocities correspond to eratic behavior
   if (!newVx) {
      newVx = 0;
   }

   if (!newVy) {
      newVy = 0;
   }

   // Super high velocities correspond to eratic behavior
   if (Math.abs(newVx) > 1) {
      newVx = Math.sign(newVx);
   }

   if (Math.abs(newVy) > 1) {
      newVy = Math.sign(newVy);
   }

   // Do some averaging between new and old velocity to smooth out eratic
   // movements
   this._state.scroll.velocityX = 0.8 * newVx +
                                  0.2 * this._state.scroll.velocityX;
   this._state.scroll.velocityY = 0.8 * newVy +
                                  0.2 * this._state.scroll.velocityY;
}; // _interactionMove()

/**
 * Handle the start of a mouse or touch interaction
 *
 * @param {number} screenX - X-coordinate of mouse click / touch
 * @param {number} screenY - Y-coordinate of mouse click / touch
 *
 * @return {void}
 */
MapViewController.prototype._interactionStart = function _interactionStart(
   screenX,
   screenY
) {
   this._state.scroll.lastScreenX = screenX;
   this._state.scroll.lastScreenY = screenY;
   this._state.scroll.previousTime = Date.now();
   this._state.scroll.velocityX = 0;
   this._state.scroll.velocityY = 0;
}; // _interactionStart()

/**
 * Handle the end of a mouse or touch interaction
 *
 * @param {string} interactionType - mouse or touch
 * @param {Event}  e               - the event that triggered this movement
 *
 * @return {void}
 */
MapViewController.prototype._interactionStop = function _interactionStop() {
   //-------------------------------------------------------------------------
   // Algorithm inspired by
   // http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
   //
   // Use an expoential curve to model future positions after mouse up or
   // touch end.
   // Start with an exponential curve, where A is a tuning constant and t is
   // elapsed time (milliseconds) after mouse up / touch end
   //    d(t) = e^(At)
   //
   // Transform to the shape we want
   //    d(t) = -B*e^(-At) + C
   //
   // Position and velocity at t=0 (moment of mouse up / touch end) must match
   // existing position and velocity, so solve for B and C
   //
   //    d(t) = v0/A (-e^(-At) + 1) + p0
   //-------------------------------------------------------------------------
   const TUNING_CONSTANT = 0.005;
   const INITIAL_POSITION_X = this._state.scroll.currentTranslationX;
   const INITIAL_POSITION_Y = this._state.scroll.currentTranslationY;
   const INITIAL_T = Date.now();
   const INITIAL_VX = this._state.scroll.velocityX;
   const INITIAL_VY = this._state.scroll.velocityY;

   /**
    * Calculation the next X position, using our inertial algorithm
    * @return {integer} The new X position
    */
   this._state.scroll.getInertiaScrollX = function getInertiaScrollX() {
      let t;
      let positionX;

      t = Date.now() - INITIAL_T;
      positionX = Math.round(INITIAL_VX/TUNING_CONSTANT *
                  (-Math.exp(-TUNING_CONSTANT*t) + 1) + INITIAL_POSITION_X);

      return positionX;
   };

   /**
    * Calculation the next Y position, using our inertial algorithm
    * @return {integer} The new Y position
    */
   this._state.scroll.getInertiaScrollY = function getInertiaScrollY() {
      let t;
      let positionY;

      t = Date.now() - INITIAL_T;
      positionY = Math.round(INITIAL_VY/TUNING_CONSTANT *
                  (-Math.exp(-TUNING_CONSTANT*t) + 1) + INITIAL_POSITION_Y);

      return positionY;
   };

   // We've setup the algorithm for inertial scroll, now request that it
   // be called
   if (
      this._state.scroll.velocityX !== 0 &&
      this._state.scroll.velocityY !== 0
   ) {
      window.requestAnimationFrame(this._inertiaScroll.bind(this));
   }
}; // _interactionStop()

/**
 * Act on the mouse being pressed
 * @param {Event} e - the Event object corresponding to this mouse event
 * @return {void}
 */
MapViewController.prototype._mouseDown = function _mouseDown(e) {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_IDLE:     // Same as for STATE_NODE_SELECTED
         case STATE_NODE_SELECTED:
            this._interactionStart(e.screenX, e.screenY);
            this._state.state = STATE_MOUSE_DOWN_ON_MAP;

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
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_MOUSE_DOWN_ON_MAP:
         case STATE_MOUSE_DRAGGING:
            this._interactionMove(e.screenX, e.screenY);
            this._state.state = STATE_MOUSE_DRAGGING;

            break;

         default:
            // Nothing
      } // switch
   }
}; // _mouseMove()

/**
 * Act on the mouse button being released
 * @param {Event} e - The event corresponding to mouse button being released
 * @return {void}
 */
MapViewController.prototype._mouseUp = function _mouseUp(e) {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_MOUSE_DOWN_ON_MAP:
         case STATE_MOUSE_DRAGGING:
            this._interactionStop();
            // Update state
            if (this._state.selectedNodeView === null) {
               this._state.state = STATE_IDLE;
            } else {
               this._state.state = STATE_NODE_SELECTED;
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
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_ONE_TOUCH_ON_MAP:
         case STATE_ONE_TOUCH_DRAGGING:
            this._interactionMove(
               e.changedTouches[0].screenX,
               e.changedTouches[0].screenY
            );
            this._state.state = STATE_ONE_TOUCH_DRAGGING;

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
 * @param {Event} e - The event corresponding to touch event ending
 * @return {void}
 */
MapViewController.prototype._touchEnd = function _touchEnd(e) {

   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_ONE_TOUCH_DRAGGING:
         case STATE_ONE_TOUCH_ON_MAP:
            // Update state
            if (this._state.selectedNodeView === null) {
               this._state.state = STATE_IDLE;
            } else {
               this._state.state = STATE_NODE_SELECTED;
            }
            this._interactionStop();
            break;

         default:
            // Nothing
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
         case STATE_IDLE:
         case STATE_NODE_SELECTED:
            this._interactionStart(
               e.changedTouches[0].screenX,
               e.changedTouches[0].screenY
            );
            this._state.state = STATE_ONE_TOUCH_ON_MAP;

            break;

         default:
            // Nothing
      } // switch
   }
}; // _touchStart()
