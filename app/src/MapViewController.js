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
import {Diagnostics} from './Diagnostics';
import {EditNodeDialog} from './EditNodeDialog';
import {m3App} from './main';
import {NodeModel} from './NodeModel';
import {Sizer} from './Sizer';
import {State} from './State';

const STATE_IDLE                 = "Idle";
const STATE_INERTIA_SCROLL       = "Intertia Scroll";
const STATE_MOUSE_DOWN_ON_MAP    = "Mouse Down On Map";
const STATE_MOUSE_DRAGGING       = "Mouse Dragging";
const STATE_NODE_SELECTED        = "Node Selected";
const STATE_ONE_TOUCH_DRAGGING   = "One Touch Dragging";
const STATE_ONE_TOUCH_ON_MAP     = "One Touch On Map";
const MOUSE_EVENT                = "Mouse Event";
const TOUCH_EVENT                = "Touch Event";

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
      oldState: STATE_IDLE,
      oldSelectedNodeView: null,
      state: STATE_IDLE,
      selectedNodeView: null,
      scroll: {
         currentTranslationX: 0,
         currentTranslationY: 0,
         lastScreenX: 0,
         lastScreenY: 0
      },
      velocityCalc: {
         lastScreenX: 0,
         lastScreenY: 0,
         previousTime: 0,
         vx: 0,
         vy: 0
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
   // Keyboard Events
   //--------------------------------------------------------------------------
   document.addEventListener("keypress", (e) => this._keyboardHandler(e));

   //--------------------------------------------------------------------------
   // Mouse Events
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("mousedown", (e) => this._mouseDown(e));

   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("mouseup", (e) => this._mouseUp(e));

   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("mousemove", (e) => this._mouseMove(e));

   //--------------------------------------------------------------------------
   // Touch Events
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("touchstart", (e) => this._touchStart(e));

   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("touchend", (e) => this._touchEnd(e));

   document.getElementById(`${App.HTML_ID_PREFIX}-drawing-area`)
           .addEventListener("touchmove", (e) => this._touchMove(e));

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

         if (parentModel !== null) {
            this._controller.addChildAfter(parentModel, selectedModel);
         }
   }
}; // addSiblingClicked()

/**
 * Delete the currently selected node, unless it's a root
 *
 * @return {void}
 */
MapViewController.prototype.deleteNodeClicked = function deleteNodeClicked() {
   let nodeToSelect;
   let selectedModel;
   let parentModel;
   let testNode;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === STATE_NODE_SELECTED) {

         selectedModel = this._state.selectedNodeView.getModel();
         parentModel = selectedModel.getParent();

         if (parentModel !== null) {
            // Select an appropriate node, with this precedence:
            //    - Next sibling if exists
            //    - Previous sibling if exists
            //    - Parent
            testNode = parentModel.getChildAfter(selectedModel);
            if (testNode !== null) {
               nodeToSelect = testNode;
            } else {
               testNode = parentModel.getChildBefore(selectedModel);
               if (testNode !== null){
                  nodeToSelect = testNode;
               } else {
                  nodeToSelect = parentModel;
               }
            }
            this.nodeClicked(nodeToSelect.getView());
            this._ensureSelectedNodeVisible();

            // Now delete it
            this._controller.deleteNode(selectedModel);
         }
   }
}; // deleteNodeClicked()

/**
 * Edit the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.editNodeClicked = function editNodeClicked() {
   let editNodeDialog;
   let selectedModel;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === STATE_NODE_SELECTED
    ) {
      editNodeDialog = new EditNodeDialog(
         this._controller,
         this._state.selectedNodeView.getModel(),
         null
      );
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
 * Center the currently selected node
 *
 * @return {void}
 */
MapViewController.prototype.centerSelectedNode =
   function centerSelectedNode(
) {
   let x;
   let y;

   if (this._state.selectedNodeView !== null) {
      ({x, y} = this._state.selectedNodeView.getCoordinates());

      this._state.scroll.currentTranslationX = Sizer.svgWidth/2 - x;
      this._state.scroll.currentTranslationY = Sizer.svgHeight/2 - y;

      this._svgGElement.setAttribute(
         "transform",
         `translate(${this._state.scroll.currentTranslationX}` +
                   `,${this._state.scroll.currentTranslationY})`
      );
   }
}; // centerSelectedNode()

/**
 * Make sure the currently selected node is visible
 *
 * @return {void}
 */
MapViewController.prototype._ensureSelectedNodeVisible =
   function _ensureSelectedNodeVisible(
) {
   const PADDING = 10;     // So node isn't right at edge of screen

   let absolutePosition;
   let deltaX = 0;
   let deltaY = 0;
   let height;
   let width;
   let x;
   let y;

   if (this._state.selectedNodeView !== null) {
      ({x, y} = this._state.selectedNodeView.getCoordinates());
      height = this._state.selectedNodeView.getBubbleHeight();
      width = this._state.selectedNodeView.getBubbleWidth();

      //----------------------------------------------------------------------
      // Horizontal
      //----------------------------------------------------------------------
      absolutePosition = x + this._state.scroll.currentTranslationX;
      if (absolutePosition < PADDING) {
         deltaX = 100 - absolutePosition;
      } else if (absolutePosition + width > Sizer.svgWidth - PADDING) {
         deltaX = Sizer.svgWidth - (absolutePosition + width + PADDING);
      }

      //----------------------------------------------------------------------
      // Vertical
      //----------------------------------------------------------------------
      absolutePosition = y + this._state.scroll.currentTranslationY;
      if (absolutePosition < 10) {
         deltaY = 100 - absolutePosition;
      } else if (absolutePosition + height > Sizer.svgHeight - PADDING) {
         deltaY = Sizer.svgHeight - (absolutePosition + height + PADDING);
      }

      this._state.scroll.currentTranslationX += deltaX;
      this._state.scroll.currentTranslationY += deltaY;

      this._svgGElement.setAttribute(
         "transform",
         `translate(${this._state.scroll.currentTranslationX}` +
                   `,${this._state.scroll.currentTranslationY})`
      );
   }
}; // _ensureSelectedNodeVisible()
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

   // We may have been pre-empted by user interaction
   if (this._state.state !== STATE_INERTIA_SCROLL) {
      return;
   }

   // Update timestamps so we can calculate velocity
   now = Date.now();
   deltaT = now - this._state.velocityCalc.previousTime;
   this._state.velocityCalc.previousTime = now;

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
   } else {
      // Inertia is done, so restore to prior state
      this._restoreState();
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
   let now;

   //-------------------------------------------------------------------------
   // Calculate and record position information
   //-------------------------------------------------------------------------
   deltaX = screenX - this._state.scroll.lastScreenX;
   deltaY = screenY - this._state.scroll.lastScreenY;

   this._state.scroll.currentTranslationX += deltaX;
   this._state.scroll.currentTranslationY += deltaY;

   this._state.scroll.lastScreenX = screenX;
   this._state.scroll.lastScreenY = screenY;

   //-------------------------------------------------------------------------
   // Do the move
   //-------------------------------------------------------------------------
   this._svgGElement.setAttribute(
      "transform", `translate(${this._state.scroll.currentTranslationX}` +
                   `,${this._state.scroll.currentTranslationY})`);

   //-------------------------------------------------------------------------
   // Calculate new velocity (pixels / millisecond)
   // Sample every 50ms to smooth out erratic touch readings
   //-------------------------------------------------------------------------
   now = Date.now();
   deltaT = now - this._state.velocityCalc.previousTime;
   if (deltaT > 50) {
      this._state.velocityCalc.previousTime = now;

      deltaX = screenX - this._state.velocityCalc.lastScreenX;
      deltaY = screenY - this._state.velocityCalc.lastScreenY;

      this._state.velocityCalc.lastScreenX = screenX;
      this._state.velocityCalc.lastScreenY = screenY;

      this._state.velocityCalc.vx = deltaX / deltaT;
      this._state.velocityCalc.vy = deltaY / deltaT;
   }
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
   this._state.velocityCalc.lastScreenX = screenX;
   this._state.velocityCalc.lastScreenY = screenY;
   this._state.velocityCalc.previousTime = Date.now();
   this._state.velocityCalc.vx = 0;
   this._state.velocityCalc.vy = 0;
}; // _interactionStart()

/**
 * Handle the end of a mouse or touch interaction
 *
 * @return {void}
 */
MapViewController.prototype._interactionStop = function _interactionStop() {
   //-------------------------------------------------------------------------
   // If both velocities are zero, there's no inertia scrolling to be done
   //-------------------------------------------------------------------------
   if (
      this._state.velocityCalc.vx === 0 &&
      this._state.velocityCalc.vy === 0
   ) {
      return;
   }

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
   const INITIAL_VX = this._state.velocityCalc.vx;
   const INITIAL_VY = this._state.velocityCalc.vy;

   /**
    * Function to calculate the next X position, using our inertial algorithm
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
    * Function to calculate the next Y position, using our inertial algorithm
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
   this._saveState();
   this._state.state = STATE_INERTIA_SCROLL;
   window.requestAnimationFrame(this._inertiaScroll.bind(this));
}; // _interactionStop()

/**
 * Handle keyboard events
 *
 * @param {Event} e - The keyboard event object
 * @return {void}
 */
MapViewController.prototype._keyboardHandler = function _keyboardHandler(e) {
   let editNodeDialog;
   let nextModel;
   let selectedNodeModel;
   let selectedNodeParent;
   let selectedNodeView;

   if (m3App.getGlobalState().getState() === State.STATE_IDLE &&
       this._state.state === STATE_NODE_SELECTED
    ) {
      selectedNodeView = this._state.selectedNodeView;
      selectedNodeModel = selectedNodeView.getModel();
      selectedNodeParent = selectedNodeModel.getParent();

      //-------------------------------------------------------------------
      // Non-ctrl displayable character starts editing the node
      // Not space, since it does folding / unfolding
      //-------------------------------------------------------------------
      if (!e.ctrlKey && e.charCode >= 33 && e.charCode <= 126) {
         editNodeDialog = new EditNodeDialog(
            this._controller,
            this._state.selectedNodeView.getModel(),
            String.fromCharCode(e.charCode)
         );
         return;
      }

      switch (e.key) {

         //-------------------------------------------------------------------
         // Space: Fold / unfold
         //-------------------------------------------------------------------
         case ' ':
            if (selectedNodeParent !== null &&
                selectedNodeModel.getChildren().length !== 0
             ) {
               this._controller.toggleFoldedStatus(selectedNodeModel);
            }
            break;

         //-------------------------------------------------------------------
         // CTRL S: Save map
         //-------------------------------------------------------------------
         case 's':
            if (e.ctrlKey) {
               this._controller.getMapModel().save();
               e.preventDefault();
            }
            break;

         //-------------------------------------------------------------------
         //      Arrow Down: Move to next sibling
         // CTRL Arrow Down: Move node down in child list
         //-------------------------------------------------------------------
         case 'ArrowDown':
            if (selectedNodeParent !== null) {
               if (e.ctrlKey) {
                  this._controller.moveNodeDown(selectedNodeModel);

               } else {
                  nextModel = selectedNodeParent.getChildAfter(
                     selectedNodeModel
                  );

                  if (nextModel === null) {
                     nextModel = selectedNodeParent.getFirstChild(
                        selectedNodeModel.getSide()
                     );
                  }

                  // Don't want to click the current node because that
                  // will deselect it
                  if (nextModel !== selectedNodeModel) {
                     this.nodeClicked(nextModel.getView());
                     this._ensureSelectedNodeVisible();
                  }
               }
            }
            e.preventDefault();
            break;

         //-------------------------------------------------------------------
         // Arrow Left:
         //    When selected node is:
         //       - Move to first left side child
         //
         //    When selected node is left side of root:
         //       - Move to first child of current node
         //
         //    When selected node is right side of root:
         //       - Move to parent of current node
         //-------------------------------------------------------------------
         case 'ArrowLeft':
            nextModel = null;

            if (selectedNodeModel.getSide() === NodeModel.POSITION_NONE) {
               // Selected node is root

               if (!selectedNodeModel.isFolded()) {
                  // Find the first child node on the left side

                  selectedNodeModel.getChildren().forEach(function (child) {
                     if (nextModel === null) {
                        if (child.getSide() === NodeModel.POSITION_LEFT) {
                           nextModel = child;
                        }
                     }
                  });
               }

            } else if (selectedNodeModel.getSide() ===
               NodeModel.POSITION_LEFT
            ) {
               // Selected node is left of root

               if (selectedNodeModel.getChildren().length > 0 &&
                   !selectedNodeModel.isFolded()) {
                  nextModel = selectedNodeModel.getChildren()[0];
               }

            } else {
               // Selected node is right of root

               nextModel = selectedNodeParent;
            }

            if (nextModel !== null) {
               this.nodeClicked(nextModel.getView());
               this._ensureSelectedNodeVisible();
            }
            break;

         //-------------------------------------------------------------------
         // Arrow Right:
         //    When selected node is root:
         //       - Move to first right side child
         //
         //    When selected node is left side of root:
         //       - Move to parent of current node
         //
         //    When selected node is right side of root:
         //       - Move to first child of current node
         //-------------------------------------------------------------------
         case 'ArrowRight':
            nextModel = null;

            if (selectedNodeModel.getSide() === NodeModel.POSITION_NONE) {
               // Selected node is root

               if (!selectedNodeModel.isFolded()) {
                  // Find the first child node on the right side

                  selectedNodeModel.getChildren().forEach(function (child) {
                     if (nextModel === null) {
                        if (child.getSide() === NodeModel.POSITION_RIGHT) {
                           nextModel = child;
                        }
                     }
                  });
               }

            } else if (selectedNodeModel.getSide() ===
               NodeModel.POSITION_LEFT
            ) {
               // Selected node is left of root

               nextModel = selectedNodeParent;

            } else {
               // Selected node is right of root

               if (selectedNodeModel.getChildren().length > 0 &&
                   !selectedNodeModel.isFolded()) {
                  nextModel = selectedNodeModel.getChildren()[0];
               }
            }

            if (nextModel !== null) {
               this.nodeClicked(nextModel.getView());
               this._ensureSelectedNodeVisible();
            }
            break;

         //-------------------------------------------------------------------
         //      Arrow Up: Move to previous sibling
         // CTRL Arrow Up: Move node up in child list
         //-------------------------------------------------------------------
         case 'ArrowUp':
            if (selectedNodeModel.getParent() !== null) {
               if (e.ctrlKey) {
                  this._controller.moveNodeUp(selectedNodeModel);

               } else {
                  nextModel = selectedNodeParent.getChildBefore(
                     selectedNodeModel
                  );

                  if (nextModel === null) {
                     nextModel = selectedNodeParent.getLastChild(
                        selectedNodeModel.getSide()
                     );
                  }

                  // Don't want to click the current node because that will
                  // deselect it
                  if (nextModel !== selectedNodeModel) {
                     this.nodeClicked(nextModel.getView());
                     this._ensureSelectedNodeVisible();
                  }
               }
            }
            e.preventDefault();
            break;

         //-------------------------------------------------------------------
         // Delete: Delete selected node
         //-------------------------------------------------------------------
         case 'Delete':
            this.deleteNodeClicked();
            break;

         //-------------------------------------------------------------------
         // End: Edit selected node and put cursor at end of text
         //-------------------------------------------------------------------
         case 'End':
            this.editNodeClicked();
            break;

         //-------------------------------------------------------------------
         // Enter: Add sibling
         //-------------------------------------------------------------------
         case 'Enter':
            this.addSiblingClicked();
            break;

         //-------------------------------------------------------------------
         //      Home: Edit selected node and put cursor at beginning of text
         // CTRL Home: Center the selected node
         //-------------------------------------------------------------------
         case 'Home':
            if (e.ctrlKey) {
               this.centerSelectedNode();
            } else {
               this.editNodeClicked();
            }
            break;

         //-------------------------------------------------------------------
         // Insert: Add child node
         //-------------------------------------------------------------------
         case 'Insert':
            this.addChildClicked();
            break;

      } // switch
   } // If appropriate state
}; // _keyboardHandler()

/**
 * Act on the mouse being pressed
 * @param {Event} e - the Event object corresponding to this mouse event
 * @return {void}
 */
MapViewController.prototype._mouseDown = function _mouseDown(e) {
   if (m3App.getGlobalState().getState() === State.STATE_IDLE) {
      switch (this._state.state) {
         case STATE_INERTIA_SCROLL:
            // Changing state signals to the inertia scroller to stop
            this._state.state = STATE_MOUSE_DOWN_ON_MAP;
            this._interactionStart(e.screenX, e.screenY);
            break;

         case STATE_IDLE:     // Same as for STATE_NODE_SELECTED
         case STATE_NODE_SELECTED:
            this._saveState();
            this._state.state = STATE_MOUSE_DOWN_ON_MAP;
            this._interactionStart(e.screenX, e.screenY);
            break;

         default:
            // Nothing
      } // switch
   }
   e.preventDefault();
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
            this._state.state = STATE_MOUSE_DRAGGING;
            this._interactionMove(e.screenX, e.screenY);
            break;

         default:
            // Nothing
      } // switch
   }
   e.preventDefault();
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
            this._restoreState();
            this._interactionStop();
            break;

         default:
            // Nothing
      } // switch
   }
   e.preventDefault();
}; // _mouseUp()

/**
 * Restore the state that was previously saved
 * @return {void}
 */
MapViewController.prototype._restoreState = function _restoreState() {
   this._state.state = this._state.oldState;
   this._state.selectedNodeView = this._state.oldSelectedNodeView;
};

/**
 * Save the state so it can be restored (like after a scroll)
 * @return {void}
 */
MapViewController.prototype._saveState = function _saveState() {
   this._state.oldState = this._state.state;
   this._state.oldSelectedNodeView = this._state.selectedNodeView;
}; // _saveState()

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
            this._restoreState();
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
         case STATE_INERTIA_SCROLL:
            // Changing state signals to the inertia scroller to stop
            this._state.state = STATE_ONE_TOUCH_ON_MAP;
            this._interactionStart(
               e.changedTouches[0].screenX,
               e.changedTouches[0].screenY
            );
            break;

         case STATE_IDLE:
         case STATE_NODE_SELECTED:
            this._saveState();
            this._state.state = STATE_ONE_TOUCH_ON_MAP;
            this._interactionStart(
               e.changedTouches[0].screenX,
               e.changedTouches[0].screenY
            );
            break;

         default:
            // Nothing
      } // switch
   }
}; // _touchStart()
