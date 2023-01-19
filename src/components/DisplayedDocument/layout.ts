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
 * Render the doc
 */
export function renderDocument(
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    rootNodeId: number,
    canvasDimensions: Dimensions,
) {
    const renderableNodes = new Map<number, Node>();
    const nodesTotalChildrenHeight = new Map<number, number>();
//    const nodesCoordinates = new Map<number, Coordinates>;
    const maxNodeWidth = 0.75 * canvasDimensions.width;

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px sans-serif`;

    createRenderableNodeAndChildren({
        renderableNodes,
        nodesTotalChildrenHeight,
        ctx,
        fontSize,
        maxWidth: maxNodeWidth,
        nodeId: rootNodeId,
    });

    renderNodeAndChildren({
        ctx,
        renderableNodes,
        nodesTotalChildrenHeight,
        nodeId: rootNodeId,
        coordinates: {
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

function createRenderableNodeAndChildren(args: {
    renderableNodes: Map<number, Node>,
    nodesTotalChildrenHeight: Map<number, number>,
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    maxWidth: number,
    nodeId: number,
}) {
    const {
        renderableNodes,
        nodesTotalChildrenHeight,
        ctx,
        fontSize,
        maxWidth,
        nodeId,
    } = args;
    const nodeIsSelected = documentState.getSelectedNodeId() === nodeId;
    const contents = documentState.getNodeContents(nodeId);

    renderableNodes.set(
        nodeId,
        new Node({ ctx, fontSize, maxWidth, nodeIsSelected, contents }),
    );

    if (documentState.getChildrenVisible(nodeId)) {
        const childIds = documentState.getNodeChildIds(nodeId);
        let totalChildrenHeight = 0;

        childIds.forEach((childId) => {
            createRenderableNodeAndChildren({
                renderableNodes,
                ctx,
                fontSize,
                maxWidth,
                nodeId: childId,
                nodesTotalChildrenHeight,
            });
            totalChildrenHeight += (nodesTotalChildrenHeight.get(childId) as number);
        });

        if (childIds.length > 0) {
            totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;
        }

        nodesTotalChildrenHeight.set(
            nodeId,
            Math.max(
                (renderableNodes.get(nodeId) as Node).getDimensions().height,
                totalChildrenHeight,
            ),
        );
    }
}

function renderNodeAndChildren(args: {
    ctx: CanvasRenderingContext2D,
    renderableNodes: Map<number, Node>,
    nodesTotalChildrenHeight: Map<number, number>,
    nodeId: number,
    coordinates: Coordinates,
}) {
    const { ctx, renderableNodes, nodesTotalChildrenHeight, nodeId, coordinates } = args;

    const renderableNode = renderableNodes.get(nodeId) as Node;
    renderableNode.render(coordinates);

    if (documentState.getChildrenVisible(nodeId)) {
        const childIds = documentState.getNodeChildIds(nodeId);

        if (childIds.length > 0) {
            const childrenX = coordinates.x + renderableNode.getDimensions().width + 10;

            let totalChildrenHeight = 0;
            childIds.forEach((childId) => {
                totalChildrenHeight += nodesTotalChildrenHeight.get(childId) as number;
            });

            totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;

            // Center children on this node
            const topOfChildrenRegion = coordinates.y -
                totalChildrenHeight / 2;

            let childY = topOfChildrenRegion;

            childIds.forEach((childId) => {
                const heightIncludingChildren = nodesTotalChildrenHeight.get(childId) as number;
                childY += heightIncludingChildren / 2;

                renderParentChildConnector(
                    ctx,
                    {
                        x: coordinates.x + renderableNode.getDimensions().width,
                        y: coordinates.y,
                    },
                    {
                        x: childrenX,
                        y: childY,
                    },
                );

                renderNodeAndChildren({
                    ctx,
                    renderableNodes,
                    nodesTotalChildrenHeight,
                    nodeId: childId,
                    coordinates: {
                        x: childrenX,
                        y: childY,
                    }
                });

                childY += heightIncludingChildren / 2;
                childY += CHILD_PADDING.y;
            });
        }
    }
}

/**
 * A helper function to get the render info for a node, which will throw an
 * exception if that info isn't found (to keep typescript happy without polluting
 * calling code)
 */
// function safeGetRenderInfo(
//     allNodesRenderInfo: Map<number, AllNodesRenderInfo>,
//     nodeId: number,
// ): AllNodesRenderInfo {
//     const renderInfo = allNodesRenderInfo.get(nodeId);
//     if (renderInfo !== undefined) return renderInfo;
//
//     throw new Error(
//         `safeGetRenderInfo: nodeId '${nodeId}' is not present`,
//     );
// }
