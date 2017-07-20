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

import {BubbleView} from './BubbleView';
import {CloudView} from './CloudView';
import {ConnectorView} from './ConnectorView';
import {FoldingIconView} from './FoldingIconView';
import {GraphicalLinkView} from './GraphicalLinkView';
import {IconView} from './IconView';
import {LinkIconView} from './LinkIconView';
import {NodeModel} from './NodeModel';
import {RichTextView} from './RichTextView';
import {TextView} from './TextView';

/**
 * A NodeView orchestrates the creation of all visual components for a node,
 * such as the text, bubble, connector, cloud, etc.
 * @constructor
 * @param {Controller} controller - The controller associated with this view
 * @param {NodeModel} myModel - The model corresponding to this view
 *
 */

export function NodeView(controller, myModel) {
   let link;

   this._controller = controller;
   this._myNodeModel = myModel;

   this._isRoot = (this._myNodeModel.getParent() === null);
   this._mostRecentCloudColor = null;
   this._myIconViews = [];
   this._myLinkIconView = null;
   this._myConnector = null;
   this._myFoldingIcon = null;
   this._mySide = this._myNodeModel.getSide();
   this._isVisible = true;

   //--------------------------------------------------------------------------
   // Create the required SVG sub-objects. Note that this just creates them,
   // but doesn't position them.
   //--------------------------------------------------------------------------
   if (this._isRoot !== true) {
      this._myConnector = new ConnectorView(this);
   }

   if (myModel.getRichText() === null) {
      this._myText = new TextView(this, myModel);
   } else {
      this._myText = new RichTextView(this, myModel);
   }

   myModel.getIcons().forEach( (icon) => {
      this._myIconViews.push(new IconView(this, icon));
   });

   // Only show http links for now
   link = myModel.getLink();
   if (link !== null && link[0] !== '#') {
      this._myLinkIconView = new LinkIconView(this, myModel);
   }

   this._myBubble = new BubbleView(
      this,
      this._myNodeModel,
      this._getBubbleContentsWidth(),
      this._getBubbleContentsHeight()
   );

   // Must create cloud here, even though we don't know the size, to ensure
   // proper z-order of clouds (parent clouds must be under child clouds)
   if (this._myNodeModel.hasCloud()) {
      this._myCloud = new CloudView(this._myNodeModel.getCloudModel());
   } else {
      this._myCloud = null;
   }

   // FoldingIcons -- only non-root nodes have them
   if (this._myNodeModel.getChildren().length !== 0 && this._isRoot !== true) {
      this._myFoldingIcon = new FoldingIconView(this, this._myNodeModel);
   }

} // NodeView()

NodeView.VERTICAL_SEPARATION = 15;  // Vertical separation between 2 child nodes

/**
 * Calculate the dimensions required to display this node. This requires
 * creating each visual component.
 *
 * @return {void}
 */
NodeView.prototype.calcDimensions = function calcDimensions() {
   let childWidthTmp;

   //--------------------------------------------------------------------------
   // If I have children and I'm not folded, then my total width and height
   // depend on width/height of my children, so have the children calculate
   // their dimensions first
   //--------------------------------------------------------------------------
   if (this._myNodeModel.getChildren().length !== 0 &&
       !this._myNodeModel.isFolded()) {

      this._myNodeModel.getChildren().forEach( (child) => {
         child.getView().calcDimensions();
      });
   }

   //--------------------------------------------------------------------------
   // myWidth and myHeight are dimensions of my bubble
   // myTotalWidth ind myTotalHeight include children and cloud (if any)
   //--------------------------------------------------------------------------
   this._myWidth = this._myBubble.getWidth();
   this._myHeight = this._myBubble.getHeight();

   if (this._isRoot) {
      //-----------------------------------------------------------------------
      // Root nodes are special because:
      //    - they don't have folding icons (even if they have children)
      //    - they can have children on both sides, which affects total width
      //      and height calculations
      //-----------------------------------------------------------------------

      // Width
      this._myTotalWidth = this._myWidth;

      if (this._myNodeModel.getChildren().length !== 0) {
         childWidthTmp = this.getMaxChildTotalWidth(NodeModel.POSITION_LEFT);
         if (childWidthTmp !== 0) {
            this._myTotalWidth += ConnectorView.WIDTH + childWidthTmp;
         }

         childWidthTmp = this.getMaxChildTotalWidth(NodeModel.POSITION_RIGHT);
         if (childWidthTmp !== 0) {
            this._myTotalWidth += ConnectorView.WIDTH + childWidthTmp;
         }
      }

      // Height
      this._myTotalHeight = this._myHeight;
      this._myTotalHeight = Math.max(this._myTotalHeight,
         this.getTotalChildrenHeight(NodeModel.POSITION_LEFT));

      this._myTotalHeight = Math.max(this._myTotalHeight,
         this.getTotalChildrenHeight(NodeModel.POSITION_RIGHT));

   } else {
      //-----------------------------------------------------------------------
      // Non-root nodes have folding icons, and children on only one side
      //-----------------------------------------------------------------------

      // Width
      this._myTotalWidth = this._myWidth;

      if (this._myNodeModel.getChildren().length !== 0) {
         this._myTotalWidth += this._myFoldingIcon.getWidth();

         if (this._myNodeModel.isFolded() !== true) {
             this._myTotalWidth += ConnectorView.WIDTH;
             this._myTotalWidth += this.getMaxChildTotalWidth(this._mySide);
         }
      }

      // Height
      this._myTotalHeight = this._myBubble.getHeight();

      if (this._myNodeModel.getChildren().length !== 0) {
         this._myTotalHeight = Math.max(this._myHeight,
            this._myFoldingIcon.getHeight());

         if (this._myNodeModel.isFolded() !== true) {
            this._myTotalHeight = Math.max(this._myTotalHeight,
               this.getTotalChildrenHeight(this._mySide));
         }
      }
   }

   //--------------------------------------------------------------------------
   // If I have a cloud, tell it the area it must enclose, then modify my own
   // dimensions
   //--------------------------------------------------------------------------
   if (this._myNodeModel.hasCloud()) {
      this._myCloud.setAreaToEnclose(this._myTotalWidth, this._myTotalHeight);
      this._myTotalWidth = this._myCloud.getWidth();
      this._myTotalHeight = this._myCloud.getHeight();
   } else {
      this._myCloud = null;
   }

}; // calcDimensions()

/**
 * Delete all visual components related to this NodeView
 * @return {void}
 */
NodeView.prototype.deleteMyself = function deleteMyself() {
   if (this._myConnector !== null) {
      this._myConnector.deleteSvg();
   }

   this._myText.deleteSvg();
   this._myBubble.deleteSvg();

   if (this._myCloud !== null) {
      this._myCloud.deleteSvg();
   }

   if (this._myFoldingIcon !== null) {
      this._myFoldingIcon.deleteSvg();
   }

   this._myIconViews.forEach( (icon) => {
      icon.deleteSvg();
   });

   if (this._myLinkIconView !== null) {
      this._myLinkIconView.deleteSvg();
   }
}; // deleteMyself()

/**
 * Draw the node and connector at the specified coordinates.
 *
 * @param {number} x - The x-coordinate of the left edge of the bubble
 * @param {number} y - The y-coordinate of the vertical middle of the bubbble
 * @param {number} parentConnectorX - The x-coordinate where connector attaches
 *                                    to this node's parent
 * @param {number} parentConnectorY - The y-coordinate where connector attaches
 *                                    to this node-s parent
 * @return {void}
 */
NodeView.prototype.drawAt = function drawAt(
   x,
   y,
   parentConnectorX,
   parentConnectorY
) {

   this._x = x;
   this._y = y;

   let childWidthTmp;
   let cloudX;
   let startX;

   //--------------------------------------------------------------------------
   // Actions required only at root level since they're recursive
   //    - Set mostRecentCloudColor (used for node backgrounds when no
   //      background color is specified)
   //--------------------------------------------------------------------------
   if (this._isRoot) {
      this.setMostRecentCloudColor(null);
   }

   // I'm being drawn, so I must be visible
   this.setVisible(true, false);

   //--------------------------------------------------------------------------
   // Connector to parent
   //--------------------------------------------------------------------------
   if (this._isRoot !== true) {
      if (this._mySide === NodeModel.POSITION_LEFT) {
         this._myConnector.setPosition(x + this.getBubbleWidth(), y,
                                       parentConnectorX, parentConnectorY);
      } else {
         this._myConnector.setPosition(x, y, parentConnectorX,
                                       parentConnectorY);
      }
   }

   //--------------------------------------------------------------------------
   // Icon(s), Text, LinkIcon
   //--------------------------------------------------------------------------
   startX = x + BubbleView.BUBBLE_INNER_PADDING;

   this._myIconViews.forEach( (iconView) => {
      iconView.setPosition(startX, y);
      startX += iconView.getWidth() + BubbleView.BUBBLE_INNER_PADDING;
   });

   this._myText.setPosition(startX, y);
   startX += this._myText.getWidth() + BubbleView.BUBBLE_INNER_PADDING;

   if (this._myLinkIconView !== null) {
      this._myLinkIconView.setPosition(startX, y);
   }

   //--------------------------------------------------------------------------
   // Bubble -- Need to set position and mostRecentCloudColor
   //--------------------------------------------------------------------------
   this._myBubble.setPosition(x, y);
   this._myBubble.setMostRecentCloudColor(this._mostRecentCloudColor);

   //--------------------------------------------------------------------------
   // Cloud
   // Positioning depends on three possibilities: I'm a:
   //    - Root node
   //    - node on left side
   //    - node on right side
   //-----------------------------------------------------------------------
   if (this._myCloud !== null) {
      if (this._isRoot) {
         // Root node--x depends on if there are children or not

         childWidthTmp = this.getMaxChildTotalWidth(NodeModel.POSITION_LEFT);
         if (childWidthTmp !== 0) {
            cloudX = x - ConnectorView.WIDTH - childWidthTmp;
         } else {
            cloudX = x;
         }

      } else if (this._mySide === NodeModel.POSITION_LEFT) {
         // Left side node--x depends on if there are children or not, and
         // whether I'm folded
         if (this._myNodeModel.getChildren().length === 0) {
            cloudX = x;
         } else {
            cloudX = x - this._myFoldingIcon.getWidth();
            childWidthTmp = this.getMaxChildTotalWidth(NodeModel.POSITION_LEFT);
            if (childWidthTmp !== 0) {
               cloudX = x - this._myFoldingIcon.getWidth() -
                        ConnectorView.WIDTH - childWidthTmp;
            }
         }
      } else {
         // Right side node
         cloudX = x;
      }

      // x-coordinate has been determined, so position the cloud
      this._myCloud.setPosition(cloudX, y);
   }

   //--------------------------------------------------------------------------
   // Children and folding icon
   //--------------------------------------------------------------------------
   if (this._myNodeModel.getChildren().length !== 0) {

      if (this._isRoot) {
         //--------------------------------------------------------------------
         // Root nodes don't have folding icons and never hide their children
         // Right now Freemind and Freeplane don't allow you to fold the root
         // node. However if that changes in the future, be proactive so
         // we don't fail.
         //--------------------------------------------------------------------
         if (this._myNodeModel.isFolded() === false) {
            this._drawChildren(NodeModel.POSITION_LEFT);
            this._drawChildren(NodeModel.POSITION_RIGHT);
         }
      } else {
         //--------------------------------------------------------------------
         // Non-root nodes have folding icons and may have hidden children
         //--------------------------------------------------------------------

         // Position the FoldingIcon
         if (this._mySide === NodeModel.POSITION_LEFT) {
            this._myFoldingIcon.setPosition(x - this._myFoldingIcon.getWidth(),
                                            y);
         } else {
            this._myFoldingIcon.setPosition(x + this._myBubble.getWidth(), y);
         }

         // Deal with children (either draw them or tell them they're invisible)
         if (this._myNodeModel.isFolded()) {
             // I'm folded, so hide my children.
            this._myNodeModel.getChildren().forEach( (child) => {
               /*
                * If child doesn't have a view, it's already not visible, so
                * don't trigger a view creation by calling getView()
                */
               if (child.hasView()) {
                  child.getView().setVisible(false, true);
               }
            });
         } else {
            this._drawChildren(this._mySide);
         }
      }
   } // dealing with children
}; // drawAt()

/**
 * Draw the children of this node that are on the specified side
 * @param {String} side - Either NodeModel.POSITION_LEFT or
 *                        NodeModel.POSITION_RIGHT
 * @return {void}
 */
NodeView.prototype._drawChildren = function _drawChildren(side) {
   let childPositionX;
   let childPositionY;
   let childView;
   let myConnectorX;
   let foldingIconWidth;

   //---------------------------------------------------------------------------
   // Determine x-coordinate of my connector
   // Root nodes are special because they have no folding icon
   //---------------------------------------------------------------------------
   if (this._isRoot) {
      foldingIconWidth = 0;
   } else {
      foldingIconWidth = this._myFoldingIcon.getWidth();
   }

   if (side === NodeModel.POSITION_LEFT) {
      myConnectorX = this._x - foldingIconWidth;
      childPositionX = myConnectorX - ConnectorView.WIDTH;

   } else {
      myConnectorX = this._x + this._myBubble.getWidth() + foldingIconWidth;
      childPositionX = myConnectorX + ConnectorView.WIDTH;
   }

   //---------------------------------------------------------------------------
   // Determine y-coordinate of top of first child
   //---------------------------------------------------------------------------
   childPositionY = this._y - this.getTotalChildrenHeight(side)/2;

   //---------------------------------------------------------------------------
   // Draw all children on the specified side
   //---------------------------------------------------------------------------
   this._myNodeModel.getChildren().forEach( (child) => {
      if (child.getSide() === side) {
         childView = child.getView();

         // Position child properly
         if (side === NodeModel.POSITION_LEFT) {
            childPositionX = myConnectorX - ConnectorView.WIDTH -
                             childView.getBubbleWidth();
         } else {
            childPositionX = myConnectorX + ConnectorView.WIDTH;
         }

         childPositionY += childView.getTotalHeight() / 2;

         childView.drawAt(childPositionX, childPositionY, myConnectorX,
                          this._y);

         // Top of next child will be below this one, including vertical
         // separation
         childPositionY += childView.getTotalHeight()/2 +
                           NodeView.VERTICAL_SEPARATION;
      } // if child was on the side to be drawn
   }); // for each child
}; // drawChildren()

/**
 * Get the height of the contents of this NodeView's bubble.
 *
 * @return {number} - the height of the contents of this node's bubble
 */
NodeView.prototype._getBubbleContentsHeight =
   function _getBubbleContentsHeight() {

   let height;
   height = this._myText.getHeight();

   if (this._myIconViews.length !== 0) {
      // All icons are the same height, so just use the first one
      height = Math.max(height, this._myIconViews[0].getHeight());
   }

   if (this._myLinkIconView !== null) {
      height = Math.max(height, this._myLinkIconView.getHeight());
   }

   return height;
}; // _getBubbleContentsHeight()

/**
 * Get the width of the contents of this NodeView's bubble.
 *
 * @return {number} - the width of the contents of this node's bubble
 */
NodeView.prototype._getBubbleContentsWidth =
   function _getBubbleContentsWidth() {

   let width;
   width = 0;

   // Need space for (icon + padding) + text + (padding + linkicon)
   if (this._myIconViews.length !== 0) {
      // All icons are the same width, so just use the first one
      width += (this._myIconViews[0].getWidth() +
                BubbleView.BUBBLE_INNER_PADDING) * this._myIconViews.length;
   }

   width += this._myText.getWidth();

   if (this._myLinkIconView !== null) {
      width += BubbleView.BUBBLE_INNER_PADDING +
               this._myLinkIconView.getWidth();
   }

   return width;
}; //_getBubbleContentsWidth()

/**
 * Get the height of this NodeView's bubble.
 *
 * @return {number} - the height of this node's bubble
 */
NodeView.prototype.getBubbleHeight = function getBubbleHeight() {
   return this._myBubble.getHeight();
}; //getBubbleHeight()

/**
 * Get the width of this NodeView's bubble.
 *
 * @return {number} - the width of this node's bubble
 */
NodeView.prototype.getBubbleWidth = function getBubbleWidth() {
   return this._myBubble.getWidth();
}; //getBubbleWidth()

/**
 * Get my coordinates
 *
 * @return {{x, y}} - my coordinates
 */
NodeView.prototype.getCoordinates = function getCoordinates() {
   return {x: this._x, y: this._y};
}; //getCoordinates()

/**
 * Get the coordinates where a graphical link (either endpoint or beginning)
 * should be.
 * @return {{x, y}} - The coordinates for a graphical link on this node
 */
NodeView.prototype.getGraphicalLinkCoords = function getGraphicalLinkCoords() {
   let coords = {x: null, y: null};

   if (this.isRoot || this._mySide === NodeModel.POSITION_RIGHT) {
      // Root and nodes on the right have their graphical links on right side
      coords.x = this._x + this._myBubble.getWidth() +
                 GraphicalLinkView.ARROW_WIDTH;

      if (this._myFoldingIcon !== null) {
         coords.x += this._myFoldingIcon.getWidth();
      }
      coords.y = this._y;
   } else {
      // Nodes on the left have their graphical links on the left side
      coords.x = this._x - GraphicalLinkView.ARROW_WIDTH;
      if (this._myFoldingIcon !== null) {
         coords.x -= this._myFoldingIcon.getWidth();
      }
      coords.y = this._y;
   }

   return coords;

}; // getGraphicalLinkCoords()

/*
 * Return the maximum width of all non-folded children of this node. The width
 * calculation will be limited to children on the specified side.
 *
 * @param {String} - NodeModel.POSITION_LEFT or NodeModel.POSITION_RIGHT
 * @return {number} - Maximum width of all the children on the specified side
 */
NodeView.prototype.getMaxChildTotalWidth = function getMaxChildTotalWidth(
   side
) {

   let returnValue = 0;

   if (this._myNodeModel.isFolded() !== true) {
      this._myNodeModel.getChildren().forEach( (child) => {
         if (child.getSide() === side) {
            returnValue = Math.max(returnValue,
                                   child.getView().getTotalWidth());
         }
      });
   }

   return returnValue;
}; // getMaxChildTotalWidth()

/**
 * Get the NodeModel associated with this view
 * @return {NodeModel} - This view's NodeModel
 */
NodeView.prototype.getModel = function getModel() {
   return this._myNodeModel;
}; // getModel()

/**
 * Get the total height of all my children. This includes clouds and separation
 * between them
 *
 * @param {String} side - Either NodeModel.POSITION_LEFT or
  *                       NodeModel.POSITION_RIGHT
 * @return {number} - Total height of all my children on the specified side
 *                    (0 if I'm folded)
 */
NodeView.prototype.getTotalChildrenHeight =
   function getChildrenTotalHeight(side) {

   let numChildrenOnSide = 0;
   let totalHeight = 0;

   if (this._myNodeModel.isFolded() !== true) {
      this._myNodeModel.getChildren().forEach( (child) => {
         if (child.getSide() === side) {
            totalHeight += child.getView().getTotalHeight();
            numChildrenOnSide += 1;
         }
      });

      totalHeight += (numChildrenOnSide - 1)*NodeView.VERTICAL_SEPARATION;
   }

   return totalHeight;
}; // getTotalChildrenHeight()

/**
 * Get the total height of this NodeView. This includes all components
 * required to draw this node, including the outer cloud
 *
 * @return {number} - the total height of this NodeView, including cloud
 */
NodeView.prototype.getTotalHeight = function getTotalHeight() {
   return this._myTotalHeight;
}; //getTotalHeight()

/**
 * Get the total width of this NodeView. This includes all components
 * required to draw this node, including the outer cloud
 *
 * @return {number} - the total width of this NodeView, including cloud
 */
NodeView.prototype.getTotalWidth = function getTotalWidth() {
   return this._myTotalWidth;
}; //getTotalWidth()
/**
 * Return whether this NodeView is visible or not
 * @return {boolean} - Whether this NodeView is visible (true) or not (false)
 */
NodeView.prototype.isVisible = function isVisible() {
   return this._isVisible;
}; // isVisible()

/**
 * Set this node's most recent cloud color. This color will be used for node
 * backgrounds that don't have their own color specified.
 *
 * Also sets it for all children.
 *
 * @param {string} color - The rgb string for the parent's most recent cloud
 *                         color
 * @return {void}
 */
NodeView.prototype.setMostRecentCloudColor = function setMostRecentCloudColor(
   color
) {
   let myCloudModel;

   this._mostRecentCloudColor = color;

   myCloudModel = this._myNodeModel.getCloudModel();
   if (myCloudModel !== null) {
      this._mostRecentCloudColor = myCloudModel.getColor();
   }

   //-------------------------------------------------------------------------
   // Now set it for all my visible children
   //-------------------------------------------------------------------------
   this._myNodeModel.getChildren().forEach((child) => {
      if (child.hasView()) {
         child.getView().setMostRecentCloudColor(this._mostRecentCloudColor);
      }
   });
};

/**
 * Signify that this nodeView has been selected.
 *
 * @param {boolean} state - true = this nodeView has been selected
 *                         false = this nodeView has been deselected
 *
 * @return {void}
 */
NodeView.prototype.setSelected = function setSelected(state) {
   this._myBubble.setSelected(state);
}; // setSelected()

/**
 * Set the visibility of this NodeView (and all it's components). The specified
 * visibility will also be applied to all children of this NodeView
 *j
 * @param {boolean} visible   - Whether this NodeView should be visible (true)
 *                              or not (false)
 * @param {boolean} recursive - Whether to apply this visibility to children
 * @return {void}
 */
NodeView.prototype.setVisible = function setVisible(visible, recursive) {
   let mapViewController;

   if (this._isVisible === visible) {
      return;
   }
   this._isVisible = visible;

   //--------------------------------------------------------------------------
   // If I'm the currently selected node, and I'm being made invisible,
   // then simulate a node click to deselect me
   //--------------------------------------------------------------------------
   mapViewController = this._controller.getMapViewController();
   if (visible === false && mapViewController.getSelectedNodeView() === this) {
      mapViewController.nodeClicked(this);
   }

   //--------------------------------------------------------------------------
   // Make all of my own components visible/hidden
   // Note: Visibility of graphical links is determine by the links themselves,
   //       since visibility of the source/dest node is not the only criteria
   //--------------------------------------------------------------------------
   if (this._myConnector !== null) {
      this._myConnector.setVisible(visible);
   }

   this._myIconViews.forEach( (icon) => {
      icon.setVisible(visible);
   });

   this._myText.setVisible(visible);

   if (this._myLinkIconView !== null) {
      this._myLinkIconView.setVisible(visible);
   }

   this._myBubble.setVisible(visible);

   if (this._myFoldingIcon !== null) {
      this._myFoldingIcon.setVisible(visible);
   }

   if (this._myCloud !== null) {
      this._myCloud.setVisible(visible);
   }

   //--------------------------------------------------------------------------
   // Make all of my children visible/hidden
   //--------------------------------------------------------------------------
   if (recursive) {
      this._myNodeModel.getChildren().forEach( (child) => {
         if (visible) {
            child.getView().setVisible(true, true);
         } else {
            /*
             * We're telling the child to be invisible. But if it doesn't
             * have a view, it's already invisible.
             */
            if (child.hasView()) {
               child.getView().setVisible(false, true);
            }
         }
      });
   }
}; // setVisible()

/**
 * Update all visual components of this NodeView from the corresponding models
 *
 * @return {void}
 */
NodeView.prototype.update = function update() {
   //--------------------------------------------------------------------------
   // Text and bubble
   //--------------------------------------------------------------------------
   this._myText.update();
   this._myBubble.update(
      this._getBubbleContentsWidth(),
      this._getBubbleContentsHeight()
   );

   //--------------------------------------------------------------------------
   // Icon(s)
   //--------------------------------------------------------------------------
   // Steps to be done her depend on what the UI implements, which hasn't been
   // done yet.

   //--------------------------------------------------------------------------
   // Link Icon
   //--------------------------------------------------------------------------
   // Handle addition of link
   if (this._myNodeModel.getLink() !== null && this._myLinkIconView === null) {
      this._myLinkIconView = new LinkIconView(this, this._myNodeModel);
   }

   // Handle deletion of link
   if (this._myNodeModel.getLink() === null && this._myLinkIconView !== null) {
      this._myLinkIconView.deleteSvg();
      this._myLinkIconView = null;
   }

   //--------------------------------------------------------------------------
   // Cloud
   //--------------------------------------------------------------------------
   // Handle addition of cloud
   if (this._myNodeModel.hasCloud() && this._myCloud === null) {
      this._myCloud = new CloudView(this._myNodeModel.getCloudModel());
   }

   // Handle deletion of cloud
   if (this._myNodeModel.hasCloud() !== true && this._myCloud !== null) {
      this._myCloud.deleteSvg();
      this._myCloud = null;
   }

   //--------------------------------------------------------------------------
   // FoldingIcon
   // (Only if not root, because root doesn't have them)
   //--------------------------------------------------------------------------
   if (this._isRoot !== true) {

      // Handle addition of first child
      if (this._myNodeModel.getChildren().length > 0 &&
            this._myFoldingIcon === null) {
         this._myFoldingIcon = new FoldingIconView(this, this._myNodeModel);
      }

      // Handle deletion of last child
      if (this._myNodeModel.getChildren().length === 0 &&
            this._myFoldingIcon !== null) {
         this._myFoldingIcon.deleteSvg();
         this._myFoldingIcon = null;
      }

      // Make sure folding status is correct
      if (this._myFoldingIcon !== null) {
         this._myFoldingIcon.update();
      }
   }

}; // update()
