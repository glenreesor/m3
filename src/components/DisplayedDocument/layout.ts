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
import { CHILD_FOLDING_ICON_RADIUS, renderChildFoldingIcon } from './childFoldingIcon';
import { getNodeRenderInfo } from './node';
import { renderParentChildConnector } from './parentChildConnector';

import {
    CircularRegion,
    Coordinates,
    Dimensions,
    RectangularRegion,
} from './types';

type ClickableCircle = CircularRegion & {id: number};
type ClickableRectangle = RectangularRegion & {id: number};

//--------------------------------------------------------------------------
// Constants for layout spacing
//
// Folding icon ─────┐            ┌──── Child-to-parent connectors
// (circle)          |            ↓
//                   ↓              ┌────────────┐
//                               ┌──| Child Node |
//                  ---          |  └────────────┘  ┐
// ┌─────────────┐ -   -         |                  |
// | Parent Node |-     -────────┤                  ├─── CHILD_PADDING.y
// └─────────────┘ -   -         |                  |
//                  ---          |  ┌────────────┐  ┘
//                └┬─┘           └──| Child Node |
//                 |                └────────────┘
// CHILD_FOLDING_ICON_RADIUS   └─┬──┘
//                               └─── CHILD_PADDING.x
//
//--------------------------------------------------------------------------
const CHILD_PADDING = {
    x: 30,
    y: 15,
};

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

interface AllNodesRenderInfo {
    renderInfo: {
        dimensions: Dimensions;
        renderNode: (parentConnectorCoordinates: Coordinates) => RectangularRegion;
    };
    heightIncludingChildren: number;
}

interface renderDocumentArgs {
    localCtx: CanvasRenderingContext2D,
    localFontSize: number;
    localCurrentDocDimensions: { width: number, height: number };
    rootNodeId: number;
    canvasDimensions: Dimensions;
}

/**
 * Render the doc
 */
export function renderDocument({
    localCtx,
    localFontSize,
    localCurrentDocDimensions,
    rootNodeId,
    canvasDimensions,
}: renderDocumentArgs) {
    ctx = localCtx;
    fontSize = localFontSize;
    currentDocDimensions = localCurrentDocDimensions;

    const allNodesRenderInfo = new Map<number, AllNodesRenderInfo>();
    calculateAllNodesRenderInfo(allNodesRenderInfo, rootNodeId);

    renderNodesRecursively(
        allNodesRenderInfo,
        rootNodeId,
        {
            x: 10,
            y: canvasDimensions.height / 2,
        },
    );
}

function calculateAllNodesRenderInfo(
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
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
            calculateAllNodesRenderInfo(allNodesRenderInfo, childId);
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
            renderInfo: thisNodeRenderInfo,
            heightIncludingChildren: Math.max(
                thisNodeRenderInfo.dimensions.height,
                totalChildrenHeight,
            ),
        },
    );
}

function renderNodesRecursively(
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    nodeId: number,
    coordinates: Coordinates,
) {
    const renderInfo = safeGetRenderInfo(allNodesRenderInfo, nodeId);
    const childrenVisible = documentState.getChildrenVisible(nodeId);
    const rectangularRegion = renderInfo.renderInfo.renderNode(coordinates);

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
        const clickableRegion = renderChildFoldingIcon({
            ctx,
            centerLeftCoordinates: {
                x: coordinates.x + renderInfo.renderInfo.dimensions.width,
                y: coordinates.y,
            },
            childrenAreVisible: childrenVisible,
        });

        // Record the region that should respond to clicks for this icon
        clickableFoldingIcons.push(
            {
                id: nodeId,
                ...clickableRegion,
            },
        );

        //------------------------------------------------------------------
        // Render children and connectors if visible
        //------------------------------------------------------------------
        if (childrenVisible) {
            const childrenX = coordinates.x +
                renderInfo.renderInfo.dimensions.width +
                2 * CHILD_FOLDING_ICON_RADIUS + CHILD_PADDING.x;

            // Center children on this node
            const topOfChildrenRegion = coordinates.y - renderInfo.heightIncludingChildren / 2;
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
                        x: coordinates.x +
                            renderInfo.renderInfo.dimensions.width +
                            2 * CHILD_FOLDING_ICON_RADIUS,
                        y: coordinates.y,
                    },
                    {
                        x: childrenX,
                        y: childY,
                    },
                );

                renderNodesRecursively(
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

function safeGetRenderInfo(
    allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
    nodeId: number,
) {
    const renderInfo = allNodesRenderInfo.get(nodeId);
    if (renderInfo !== undefined) return renderInfo;

    throw new Error(
        `safeGetRenderInfo: nodeId '${nodeId}' is not present`,
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
