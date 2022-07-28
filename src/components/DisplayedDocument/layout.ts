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
import { getNodeRenderInfo } from './node';
import { Coordinates, Dimensions } from './types';

// Description of a circular region that should be clickable
interface ClickableCircle {
    // The ID of this object (e.g. a nodeId for a folding icon)
    id: number,

    // Center x-coordinate
    x: number,

    // Center y-coordinate
    y: number,

    // Radius of the circle
    radius: number,
}

// Description of a rectangular region that should be clickable
interface ClickableRectangle {
    // The ID of this object (e.g. a nodeId)
    id: number,

    // Top left corner x-coordinate
    x: number,

    // Top left corner y-coordinate
    y: number,

    // Width of the rectangle
    width: number,

    // Height of the rectangle
    height: number,
}

//--------------------------------------------------------------------------
// Constants for layout spacing
//
// Folding icon ─────┐      ┌──── Child-to-parent connectors
// (circle)          |      ↓
//                   ↓        ┌────────────┐
//                         ┌──| Child Node |
//                  ---    |  └────────────┘  ┐
// ┌─────────────┐ -   -   |                  |
// | Parent Node |-     -──┤                  ├─── CHILD_PADDING.y
// └─────────────┘ -   -   |                  |
//                  ---    |  ┌────────────┐  ┘
//                └┬─┘     └──| Child Node |
//                 |          └────────────┘
// FOLDING_ICON_RADIUS   └─┬──┘
//                         └─── CHILD_PADDING.x
//
//--------------------------------------------------------------------------
const CHILD_PADDING = {
    x: 30,
    y: 15,
};
const FOLDING_ICON_RADIUS = 10;

let ctx: CanvasRenderingContext2D;
let fontSize: number;

let currentDocDimensions: {
    width: number;
    height: number;
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

/**
 * Temporary hack to get some global variables
 *
 * @param localCtx                  Drawing Context
 * @param localFontSize             Current font size
 * @param localCurrentDocDimensions Current document dimensions
 */
export function hackSetLocallyGlobal(
    localCtx: CanvasRenderingContext2D,
    localFontSize: number,
    localCurrentDocDimensions: { width: number, height: number },
) {
    ctx = localCtx;
    fontSize = localFontSize;
    currentDocDimensions = localCurrentDocDimensions;
}

interface NEWAllNodesRenderInfo {
    renderInfo: {
        dimensions: Dimensions;
        renderNode: (parentConnectorCoordinates: Coordinates) => void;
    };
    heightIncludingChildren: number;
}

interface NEWRenderDocumentArgs {
    localCtx: CanvasRenderingContext2D,
    localFontSize: number;
    localCurrentDocDimensions: { width: number, height: number };
    rootNodeId: number;
    canvasDimensions: Dimensions;
}

/**
 * Render the doc
 */
export function NEWrenderDocument({
    localCtx,
    localFontSize,
    localCurrentDocDimensions,
    rootNodeId,
    canvasDimensions,
}: NEWRenderDocumentArgs) {
    ctx = localCtx;
    fontSize = localFontSize;
    currentDocDimensions = localCurrentDocDimensions;

    const allNodesRenderInfo = new Map<number, NEWAllNodesRenderInfo>();
    NEWcalculateAllNodesRenderInfo(allNodesRenderInfo, rootNodeId);

    NEWrenderNodesRecursively(
        allNodesRenderInfo,
        rootNodeId,
        {
            x: 10,
            y: canvasDimensions.height / 2,
        },
    );
}

function NEWcalculateAllNodesRenderInfo(
    allNodesRenderInfo: Map<number, NEWAllNodesRenderInfo>,
    nodeId: number,
) {
    const nodeIsSelected = documentState.getSelectedNodeId() === nodeId;
    const nodeContents = documentState.getNodeContents(nodeId);

    const thisNodeRenderInfo = getNodeRenderInfo({
        ctx,
        fontSize,
        maxWidth: 0.75 * currentDocDimensions.width,
        nodeIsSelected,
        contents: nodeContents,
    });

    // Calculate total height of children if they're visible
    let totalChildrenHeight = 0;

    if (documentState.getChildrenVisible(nodeId)) {
        const childIds = documentState.getNodeChildIds(nodeId);
        childIds.forEach((childId) => {
            NEWcalculateAllNodesRenderInfo(allNodesRenderInfo, childId);
            totalChildrenHeight += NEWsafeGetRenderInfo(
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
            renderInfo: thisNodeRenderInfo,
            heightIncludingChildren: Math.max(
                thisNodeRenderInfo.dimensions.height,
                totalChildrenHeight,
            ),
        },
    );
}

function NEWrenderNodesRecursively(
    allNodesRenderInfo: Map<number, NEWAllNodesRenderInfo>,
    nodeId: number,
    coordinates: Coordinates,
) {
    const renderInfo = NEWsafeGetRenderInfo(allNodesRenderInfo, nodeId);
    const childrenVisible = documentState.getChildrenVisible(nodeId);
    renderInfo.renderInfo.renderNode(coordinates);

    // Record the region that should respond to clicks for this node
    clickableNodes.push(
        {
            id: nodeId,
            x: coordinates.x,
            y: coordinates.y - renderInfo.renderInfo.dimensions.height / 2,
            width: renderInfo.renderInfo.dimensions.width,
            height: renderInfo.renderInfo.dimensions.height,
        },
    );

    const childIds = documentState.getNodeChildIds(nodeId);
    if (childIds.length > 0) {
        //------------------------------------------------------------------
        // Render the folding icon
        //------------------------------------------------------------------
        const foldingIconPos = {
            x: coordinates.x + renderInfo.renderInfo.dimensions.width + FOLDING_ICON_RADIUS,
            y: coordinates.y,
        };

        ctx.beginPath();
        ctx.arc(
            foldingIconPos.x,
            foldingIconPos.y,
            FOLDING_ICON_RADIUS,
            0,
            2 * Math.PI,
        );

        if (childrenVisible) {
            ctx.stroke();
        } else {
            ctx.fill();
        }

        // Record the region that should respond to clicks for this icon
        clickableFoldingIcons.push(
            {
                id: nodeId,
                x: foldingIconPos.x,
                y: foldingIconPos.y,
                radius: FOLDING_ICON_RADIUS,
            },
        );

        //------------------------------------------------------------------
        // Render children and connectors if visible
        //------------------------------------------------------------------
        if (childrenVisible) {
            const childrenX = foldingIconPos.x + FOLDING_ICON_RADIUS + CHILD_PADDING.x;

            // Center children on this node
            const topOfChildrenRegion = coordinates.y - renderInfo.heightIncludingChildren / 2;
            let childY = topOfChildrenRegion;

            childIds.forEach((childId) => {
                const { heightIncludingChildren } = NEWsafeGetRenderInfo(
                    allNodesRenderInfo,
                    childId,
                );
                childY += heightIncludingChildren / 2;

                renderChildConnector(
                    {
                        x: foldingIconPos.x + FOLDING_ICON_RADIUS,
                        y: foldingIconPos.y,
                    },
                    {
                        x: childrenX,
                        y: childY,
                    },
                );

                NEWrenderNodesRecursively(
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
    }
}

function NEWsafeGetRenderInfo(
    allNodesRenderInfo: Map<number, NEWAllNodesRenderInfo>,
    nodeId: number,
) {
    const renderInfo = allNodesRenderInfo.get(nodeId);
    if (renderInfo !== undefined) return renderInfo;

    throw new Error(
        `NEWsafeGetRenderInfo: nodeId '${nodeId}' is not present`,
    );
}


/**
 * bla
 *
 * @param pointerX X-coordinate of pointer positions
 * @param pointerY Y-coordinate of pointer positions
 */
export function onCanvasClick(pointerX: number, pointerY: number) {
    // Compare to clickable regions for nodes
    clickableNodes.forEach((region) => {
        if (
            (pointerX >= region.x && pointerX <= region.x + region.width) &&
            (pointerY >= region.y && pointerY <= region.y + region.height)
        ) {
            documentState.setSelectedNodeId(region.id);
        }
    });

    // Compare to clickable regions for folding icons
    clickableFoldingIcons.forEach((region) => {
        const distanceToCenter = Math.sqrt(
            (pointerX - region.x) ** 2 +
            (pointerY - region.y) ** 2,
        );

        if (distanceToCenter <= region.radius) {
            documentState.toggleChildrenVisibility(region.id);
        }
    });
}

/**
 * Render the curve that connects a parent node to a child node
 *
 * @param curveStart The coordinates for the start of the curve
 * @param curveEnd   The coordinates for the end of the curve
 */
function renderChildConnector(
    curveStart: Coordinates,
    curveEnd: Coordinates,
) {
    ctx.beginPath();
    ctx.moveTo(curveStart.x, curveStart.y);
    ctx.bezierCurveTo(
        curveEnd.x,
        curveStart.y,
        curveStart.x,
        curveEnd.y,
        curveEnd.x,
        curveEnd.y,
    );

    ctx.stroke();
}
