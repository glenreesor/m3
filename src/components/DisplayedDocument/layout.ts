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
import { getNodeRenderInfo } from './shapes/node';
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
let clickableFoldingIcons: ClickableCircle[] = [];
let clickableNodes: ClickableRectangle[] = [];

/**
 * Reset clickable regions (probably due to canvas being resized)
 */
export function resetClickableRegions() {
    clickableFoldingIcons = [];
    clickableNodes = [];
}

interface AllNodesRenderInfo {
    dimensions: Dimensions;
    heightIncludingChildren: number;
    renderNode: (parentConnectorCoordinates: Coordinates) => RectangularRegion;
}

/**
 * Render the doc
 */
export function renderDocument(
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    rootNodeId: number,
    canvasDimensions: Dimensions,
) {
    const allNodesRenderInfo = new Map<number, AllNodesRenderInfo>();
    const maxNodeWidth = 0.75 * canvasDimensions.width;

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px sans-serif`;

    calculateAllNodesRenderInfo(ctx, fontSize, maxNodeWidth, allNodesRenderInfo, rootNodeId);

    renderNodesRecursively(
        ctx,
        allNodesRenderInfo,
        rootNodeId,
        {
            x: 10,
            y: canvasDimensions.height / 2,
        },
    );
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

/**
 * Calculate the info required to render a node and all of its children,
 * saving that info in `allNodexRenderInfo`
 */
function calculateAllNodesRenderInfo(
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    maxNodeWidth: number,
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    nodeId: number,
) {
    const nodeIsSelected = documentState.getSelectedNodeId() === nodeId;
    const nodeContents = documentState.getNodeContents(nodeId);

    const thisNodeRenderInfo = getNodeRenderInfo({
        ctx,
        fontSize,
        maxWidth: maxNodeWidth,
        nodeIsSelected,
        contents: nodeContents,
    });

    // Calculate total height of children if they're visible
    let totalChildrenHeight = 0;

    if (documentState.getChildrenVisible(nodeId)) {
        const childIds = documentState.getNodeChildIds(nodeId);

        childIds.forEach((childId) => {
            calculateAllNodesRenderInfo(ctx, fontSize, maxNodeWidth, allNodesRenderInfo, childId);
            totalChildrenHeight += safeGetRenderInfo(
                allNodesRenderInfo,
                childId,
            ).heightIncludingChildren;
        });

        if (childIds.length > 0) {
            totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;
        }
    }

    allNodesRenderInfo.set(
        nodeId,
        {
            ...thisNodeRenderInfo,
            heightIncludingChildren: Math.max(
                thisNodeRenderInfo.dimensions.height,
                totalChildrenHeight,
            ),
        },
    );
}

function renderChildrenAndConnectors(
    ctx: CanvasRenderingContext2D,
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    parentFoldingIconCenterRight: {x: number, y: number},
    childIds: number[],
    totalChildrenHeight: number,
) {
    const childrenX = parentFoldingIconCenterRight.x + CHILD_PADDING.x;

    // Center children on this node
    const topOfChildrenRegion = parentFoldingIconCenterRight.y -
        totalChildrenHeight / 2;

    let childY = topOfChildrenRegion;

    childIds.forEach((childId) => {
        const { heightIncludingChildren } = safeGetRenderInfo(
            allNodesRenderInfo,
            childId,
        );
        childY += heightIncludingChildren / 2;

        renderParentChildConnector(
            ctx,
            {
                x: parentFoldingIconCenterRight.x,
                y: parentFoldingIconCenterRight.y,
            },
            {
                x: childrenX,
                y: childY,
            },
        );

        renderNodesRecursively(
            ctx,
            allNodesRenderInfo,
            childId,
            {
                x: childrenX,
                y: childY,
            },
        );
        childY += heightIncludingChildren / 2;
        childY += CHILD_PADDING.y;
    });
}

/**
 * Render the specified node and all its descendants
 */
function renderNodesRecursively(
    ctx: CanvasRenderingContext2D,
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    nodeId: number,
    coordinates: Coordinates,
) {
    const renderInfo = safeGetRenderInfo(allNodesRenderInfo, nodeId);
    const childrenVisible = documentState.getChildrenVisible(nodeId);
    const rectangularRegion = renderInfo.renderNode(coordinates);

    // Record the region that should respond to clicks for this node
    clickableNodes.push(
        {
            id: nodeId,
            ...rectangularRegion,
        },
    );

    const childIds = documentState.getNodeChildIds(nodeId);
    if (childIds.length > 0) {
        //------------------------------------------------------------------
        // Render the folding icon
        //------------------------------------------------------------------
        const clickableRegion = renderChildFoldingIcon(
            ctx,
            {
                x: coordinates.x + renderInfo.dimensions.width,
                y: coordinates.y,
            },
            childrenVisible,
        );

        // Record the region that should respond to clicks for this icon
        clickableFoldingIcons.push(
            {
                id: nodeId,
                ...clickableRegion,
            },
        );

        if (childrenVisible) {
            const foldingIconCenterRight = {
                x: coordinates.x + renderInfo.dimensions.width + 2 * CHILD_FOLDING_ICON_RADIUS,
                y: coordinates.y,
            };

            renderChildrenAndConnectors(
                ctx,
                allNodesRenderInfo,
                foldingIconCenterRight,
                childIds,
                renderInfo.heightIncludingChildren,
            );
        }
    }
}

/**
 * A helper function to get the render info for a node, which will throw an
 * exception if that info isn't found (to keep typescript happy without polluting
 * calling code)
 */
function safeGetRenderInfo(
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    nodeId: number,
): AllNodesRenderInfo {
    const renderInfo = allNodesRenderInfo.get(nodeId);
    if (renderInfo !== undefined) return renderInfo;

    throw new Error(
        `safeGetRenderInfo: nodeId '${nodeId}' is not present`,
    );
}
