// Copyright 2022 Glen Reesor
//
// This file is part of m3 Mind Mapper.
//
// m3 Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// m3 Mind Mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// m3 Mind Mapper. If not, see <https://www.gnu.org/licenses/>.

import documentState from '../../state/documentState';
import { CHILD_FOLDING_ICON_RADIUS, renderChildFoldingIcon } from './shapes/childFoldingIcon';
import Node from './shapes/Node';
import { renderParentChildConnector } from './shapes/parentChildConnector';

import {
    CircularRegion,
    Coordinates,
    Dimensions,
    RectangularRegion,
} from './types';

type ClickableCircle = CircularRegion & {id: number};
type ClickableRectangle = RectangularRegion & {id: number};

//--------------------------------------------------------------------------
//                       ┌──── parentFoldingIconCenterRight
//                       |
//                       |          ┌────────────┐
//                       |       ┌──| Child Node |
//                  ---  |       |  └────────────┘  ┐
// ┌─────────────┐ -   - V       |                  |
// | Parent Node |-     -────────┤                  ├─── CHILD_PADDING.y
// └─────────────┘ -   -         |                  |
//                  ---          |  ┌────────────┐  ┘
//                               └──| Child Node |
//                                  └────────────┘
//                       └────┬─────┘
//                            └─── CHILD_PADDING.x
//--------------------------------------------------------------------------
const CHILD_PADDING = {
    x: 30,
    y: 15,
};

// List of clickable regions (created upon each render)
let clickableFoldingIcons: ClickableCircle[];
let clickableNodes: ClickableRectangle[];

let localCtx: CanvasRenderingContext2D;
let renderableNodes: Map<number, Node>;
let nodesHeightIncludingChildren: Map<number, number>;

/**
 * Render the doc
 */
export function renderDocument(
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    rootNodeId: number,
    canvasDimensions: Dimensions,
) {
    localCtx = ctx;
    renderableNodes = new Map();
    nodesHeightIncludingChildren = new Map();
    clickableFoldingIcons = [];
    clickableNodes = [];

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px sans-serif`;

    const maxNodeWidth = 0.75 * canvasDimensions.width;

    createRenderingInfo({
        fontSize,
        maxNodeWidth,
        nodeId: rootNodeId,
    });

    renderNodeAndChildren({
        nodeId: rootNodeId,
        coordinatesCenterLeft: {
            x: 10,
            y: canvasDimensions.height / 2,
        },
    });
}

/**
 * Process a click on the canvas at the specified coordinates, selecting a node,
 * folding / unfolding children, etc as required.
 *
 */
export function onCanvasClick(pointerX: number, pointerY: number) {
    // Compare to clickable regions for nodes
    clickableNodes.forEach((region) => {
        if (
            (
                pointerX >= region.topLeft.x &&
                pointerX <= region.topLeft.x + region.dimensions.width
            ) &&
            (
                pointerY >= region.topLeft.y &&
                pointerY <= region.topLeft.y + region.dimensions.height
            )
        ) {
            documentState.setSelectedNodeId(region.id);
        }
    });

    // Compare to clickable regions for folding icons
    clickableFoldingIcons.forEach((region) => {
        const distanceToCenter = Math.sqrt(
            (pointerX - region.center.x) ** 2 +
            (pointerY - region.center.y) ** 2,
        );

        if (distanceToCenter <= region.radius) {
            documentState.toggleChildrenVisibility(region.id);
        }
    });
}
//------------------------------------------------------------------------------
// Private Interface
//------------------------------------------------------------------------------

function createRenderingInfo(args: {
    fontSize: number,
    maxNodeWidth: number,
    nodeId: number,
}) {
    const {
        fontSize,
        maxNodeWidth,
        nodeId,
    } = args;
    const nodeIsSelected = documentState.getSelectedNodeId() === nodeId;
    const contents = documentState.getNodeContents(nodeId);

    renderableNodes.set(
        nodeId,
        new Node({ ctx: localCtx, fontSize, maxWidth: maxNodeWidth, nodeIsSelected, contents }),
    );

    let totalChildrenHeight = 0;

    if (documentState.getChildrenVisible(nodeId)) {
        const childIds = documentState.getNodeChildIds(nodeId);

        childIds.forEach((childId) => {
            createRenderingInfo({
                fontSize,
                maxNodeWidth,
                nodeId: childId,
            });
            totalChildrenHeight += safeGetNodeHeightIncludingChildren(childId);
        });

        if (childIds.length > 0) {
            totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;
        }
    }
    nodesHeightIncludingChildren.set(
        nodeId,
        Math.max(
            safeGetRenderableNode(nodeId).getDimensions().height,
            totalChildrenHeight,
        ),
    );
}

function renderNodeAndChildren(args: {
    nodeId: number,
    coordinatesCenterLeft: Coordinates,
}) {
    const {
        nodeId,
        coordinatesCenterLeft,
    } = args;

    const renderableNode = safeGetRenderableNode(nodeId);

    const clickableNodeRegion = renderableNode.render(coordinatesCenterLeft);
    clickableNodes.push({
        ...clickableNodeRegion,
        id: nodeId,
    });

    const childIds = documentState.getNodeChildIds(nodeId);

    if (childIds.length > 0) {
        const childrenAreVisible = documentState.getChildrenVisible(nodeId);

        // Render the folding icon
        const foldingIconX = coordinatesCenterLeft.x + renderableNode.getDimensions().width;
        const foldingIconY = coordinatesCenterLeft.y;

        const clickableRegion = renderChildFoldingIcon(
            localCtx,
            { x: foldingIconX, y: foldingIconY },
            childrenAreVisible,
        );
        clickableFoldingIcons.push({
            id: nodeId,
            ...clickableRegion,
        });

        if (childrenAreVisible) {
            renderChildrenAndConnectors(
                {
                    x: foldingIconX + CHILD_FOLDING_ICON_RADIUS * 2,
                    y: coordinatesCenterLeft.y,
                },
                childIds,
            );
        }
    }
}

function renderChildrenAndConnectors(
    foldingIconRightCoordinates: Coordinates,
    childIds: number[],
) {
    const childrenX = foldingIconRightCoordinates.x + CHILD_PADDING.x;

    let totalChildrenHeight = 0;
    childIds.forEach((childId) => {
        totalChildrenHeight += safeGetNodeHeightIncludingChildren(childId);
    });

    totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;

    const topOfChildrenRegion = foldingIconRightCoordinates.y -
        totalChildrenHeight / 2;

    let childY = topOfChildrenRegion;

    childIds.forEach((childId) => {
        const heightIncludingChildren = safeGetNodeHeightIncludingChildren(childId);

        childY += heightIncludingChildren / 2;

        renderParentChildConnector(
            localCtx,
            {
                x: foldingIconRightCoordinates.x,
                y: foldingIconRightCoordinates.y,
            },
            {
                x: childrenX,
                y: childY,
            },
        );

        renderNodeAndChildren({
            nodeId: childId,
            coordinatesCenterLeft: {
                x: childrenX,
                y: childY,
            },
        });

        childY += heightIncludingChildren / 2;
        childY += CHILD_PADDING.y;
    });
}

/**
 * A helper function to get an entry from nodesHeightIncludingChildren, which
 * will throw an exception if that info isn't found (to keep typescript happy
 * without polluting calling code)
 */
function safeGetNodeHeightIncludingChildren(nodeId: number): number {
    const heightIncludingChildren = nodesHeightIncludingChildren.get(nodeId);
    if (heightIncludingChildren !== undefined) return heightIncludingChildren;

    throw new Error(
        `safeGetNodeHeightIncludingChildren: nodeId '${nodeId}' is not present`,
    );
}

/**
 * A helper function to get an entry from renderableNodes, which will throw an
 * exception if that info isn't found (to keep typescript happy without polluting
 * calling code)
 */
function safeGetRenderableNode(nodeId: number): Node {
    const node = renderableNodes.get(nodeId);
    if (node !== undefined) return node;

    throw new Error(
        `safeGetRenderableNode: nodeId '${nodeId}' is not present`,
    );
}
