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

import * as m from 'mithril';
import documentState from '../state/documentState';
import uiState from '../state/uiState';

interface Attrs {
    documentDimensions: {
        height: number,
        width: number,
    },
    performReset: boolean,
}

/**
 * A component to render the user's document in a <canvas> element
 *
 * @returns An object to be consumed by m()
 */
function DisplayedDocument(): m.Component<Attrs> {
    //--------------------------------------------------------------------------
    // Interfaces and Types
    //--------------------------------------------------------------------------
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

    interface Coordinates {
        x: number,
        y: number,
    }

    interface NodeDimensionInfo {
        // The height of the node's bubble
        bubbleHeight: number,

        // The width of the node's bubble
        bubbleWidth: number,

        // Total height of this node and its visible children
        heightWithChildren: number,
    }

    //--------------------------------------------------------------------------
    // Dependent Interfaces and Types
    //--------------------------------------------------------------------------
    type AllDimensions = Map<number, NodeDimensionInfo>;

    //--------------------------------------------------------------------------
    // Constants for layout spacing
    //
    // ┌───────────────────────┐  ┐
    // |                       |  ├─── NODE_PADDING.y
    // |                       |  ┘
    // |     Node Contents     |
    // |                       |
    // |                       |
    // └───────────────────────┘
    // └──┬──┘
    //    └────── NODE_PADDING.x
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
    const NODE_PADDING = {
        x: 5,
        y: 5,
    };

    const NODE_LINES_VERTICAL_PADDING = 4;

    const devicePixelRatio = window.devicePixelRatio || 1;

    let fontSize = uiState.getCurrentFontSize();

    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    const currentDocDimensions = {
        width: -1,
        height: -1,
    };

    // List of clickable regions (created upon each render)
    let clickableFoldingIcons: ClickableCircle[] = [];
    let clickableNodes: ClickableRectangle[] = [];

    // Whether the user is dragging the document
    let dragging = false;

    // Coordinates of the mouse/pointer at previous translation event
    let previousPointerCoords = {
        x: 0,
        y: 0,
    };

    // Total translations amount -- required for resetting translation when
    // canvas gets resized
    const cumulativeCanvasTranslation = {
        x: 0,
        y: 0,
    };

    /**
     * Calculate dimensions for the specified node and all children of that
     * node. Store these dimensions in allDimensions, keyed by nodeId.
     *
     * Calling this function with the root node's ID will result in
     * allDimensions being populated with DimensionInfo for every node in the
     * document.
     *
     * @param allDimensions The Map in which to insert dimension info
     * @param nodeId        The node whose dimensions are to be calculated
     */
    function calculateDimensions(allDimensions: AllDimensions, nodeId: number) {
        // Determine dimensions for the specified node's contents
        const linesForThisNode = getNodeLines(documentState.getNodeContents(nodeId));
        const maxLineWidth = linesForThisNode.reduce(
            (acc, line) => {
                const textMetrics = ctx.measureText(line);
                return textMetrics.width > acc ? textMetrics.width : acc;
            },
            0,
        );
        const bubbleDim = {
            h: (fontSize * linesForThisNode.length) +
                NODE_LINES_VERTICAL_PADDING * (linesForThisNode.length - 1) +
                2 * NODE_PADDING.y,
            w: maxLineWidth + 2 * NODE_PADDING.x,
        };

        let totalChildrenHeight = 0;

        // Calculate height of children if they're visible
        if (documentState.getChildrenVisible(nodeId)) {
            const childIds = documentState.getNodeChildIds(nodeId);

            // Determine total height of this node's children

            childIds.forEach((childId) => {
                calculateDimensions(allDimensions, childId);
                totalChildrenHeight += safeGetDimensions(allDimensions, childId).heightWithChildren;
            });

            // Also account for vertical padding between child nodes
            if (childIds.length > 0) {
                totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;
            }
        }

        // We have all the required dimensions, so store them.
        // Note that even if there are multiple children, the contents of the
        // current node may still be higher than all the children, hence
        // the Math.max() below.
        allDimensions.set(
            nodeId,
            {
                bubbleHeight: bubbleDim.h,
                bubbleWidth: bubbleDim.w,
                heightWithChildren: Math.max(bubbleDim.h, totalChildrenHeight),
            },
        );
    }

    /**
     * Stop dragging of user document
     */
    function dragEnd() {
        dragging = false;
    }

    /**
     * Handle a mouse or touch move event for dragging the document
     *
     * @param x The mouse/touch x-coordinate
     * @param y The mouse/touch y-coordinate
     */
    function dragMove(x: number, y: number) {
        if (!dragging) return;

        // Calculate how much the pointer moved
        const deltaX = x - previousPointerCoords.x;
        const deltaY = y - previousPointerCoords.y;

        // Store current pointer coordinates so we can use that in delta
        // calculation for the next move event
        previousPointerCoords = { x, y };

        // Determine the total amount the canvas has been translated so we can
        // take that into account for click targets
        cumulativeCanvasTranslation.x += deltaX;
        cumulativeCanvasTranslation.y += deltaY;

        // Translate the canvas
        ctx.translate(deltaX, deltaY);
    }

    /**
     * Handle a mouse or touch start event, which signifies start of dragging
     * the document
     *
     * @param x The mouse/touch x-coordinate
     * @param y The mouse/touch y-coordinate
     */
    function dragStart(x: number, y: number) {
        dragging = true;
        previousPointerCoords = { x, y };
    }

    /**
     * Get the lines of text to be rendered from the specified contents.
     * There will only be multiple lines if the contents, when rendered,
     * will be longer than our max node width
     *
     * @param contents The contents of the node to be rendered
     * @returns The lines to render, such that no line is longer than the
     *          maximum
     */
    function getNodeLines(contents: string): string[] {
        const lines = [];
        let remainingContents = contents.slice();

        while (remainingContents !== '') {
            let lastChar = remainingContents.length - 1;
            let requiredWidth = ctx.measureText(
                remainingContents.substring(0, lastChar + 1),
            ).width;

            while (
                requiredWidth > 0.75 * currentDocDimensions.width &&
                lastChar > 0
            ) {
                lastChar -= 1;
                while (
                    remainingContents.charAt(lastChar) !== ' ' &&
                    lastChar > 0
                ) {
                    lastChar -= 1;
                }
                requiredWidth = ctx.measureText(
                    remainingContents.substring(0, lastChar + 1),
                ).width;
            }

            lines.push(remainingContents.substring(0, lastChar + 1));
            remainingContents = remainingContents.slice(lastChar + 1);
        }

        return lines;
    }

    /**
     * Get the y-coordinates for child nodes, relative to the vertical
     * center of the parent node.
     *
     * @param allDimensions The Map that has dimensions for every node in the
     *                      document
     * @param parentDims    The dimension info of the parent node
     * @param childIds      The IDs of the children whose y-coordinates we
     *                      want returned
     * @returns An array of objects with the following keys:
     *              bubbleTop    - The y-coordinate for the top of the child's
     *                             bubble
     *              bubbleCenter - The y-coordinate of the vertical center
     *                             of the child's bubble
     */
    function getNodesRelativeYCoordinates(
        allDimensions: AllDimensions,
        parentDims: NodeDimensionInfo,
        childIds: Array<number>,
    ): Array<{bubbleTop: number, bubbleCenter: number}> {
        // Children are centered vertically on the parent node:
        //                 ┌──────────────────────────────┐
        //                 |                              |
        // ┌──────────┐    |                              |
        // |parentNode|    |         All Children         |
        // └──────────┘    |                              |
        //                 |                              |
        //                 └──────────────────────────────┘
        //
        // The top of the first child (and all of it's children) is at the
        // top of the box shown above.
        // The top of the second child (and all of it's children) is below
        // that.
        // And so on.
        //  ┌─────────────────────────────────────┐
        //  |     ┌─────────────────────────┐     |
        //  |     |           Grandchild 1  |     |
        //  |     |  Child 1  Grandchild 2  |     |
        //  |     |           Grandchild 3  |     |
        //  |     └─────────────────────────┘     |
        //  |                                     |
        //  |     ┌─────────────────────────┐     |
        //  |     |           Grandchild 1  |     |
        //  |     |  Child 1  Grandchild 2  |     |
        //  |     |           Grandchild 3  |     |
        //  |     └─────────────────────────┘     |
        //  └─────────────────────────────────────┘

        const yCoords: Array<{bubbleTop: number, bubbleCenter: number}> = [];

        //------------------------------------------------------------------
        // Determine y-coordinate (top left) for the box occupied by the first
        // child and its children
        //------------------------------------------------------------------
        let nextChildBoxY = -1 * parentDims.heightWithChildren / 2;

        childIds.forEach((childId) => {
            const thisChildDims = safeGetDimensions(allDimensions, childId);

            // This child must be centered vertically in the space it and
            // it's children will occupy
            const thisChildBoxCenter = nextChildBoxY + thisChildDims.heightWithChildren / 2;

            yCoords.push({
                bubbleTop: thisChildBoxCenter - thisChildDims.bubbleHeight / 2,
                bubbleCenter: thisChildBoxCenter,
            });

            // Setup for the next child
            nextChildBoxY += thisChildDims.heightWithChildren + CHILD_PADDING.y;
        });

        return yCoords;
    }

    /**
     * Handle a click or tap on this canvas. Compare the clicked coordinates
     * to our clickable regions and handle as appropriate.
     *
     * @param e The mouse event corresponding to the click
     */
    function onClick(e: MouseEvent) {
        // Convert the mouse coordinates to be relative to the canvas
        const canvasX = e.pageX - canvasElement.offsetLeft - cumulativeCanvasTranslation.x;
        const canvasY = e.pageY - canvasElement.offsetTop - cumulativeCanvasTranslation.y;

        // Compare to clickable regions for nodes
        clickableNodes.forEach((region) => {
            if (
                (canvasX >= region.x && canvasX <= region.x + region.width)
                && (canvasY >= region.y && canvasY <= region.y + region.height)
            ) {
                documentState.setSelectedNodeId(region.id);
            }
        });

        // Compare to clickable regions for folding icons
        clickableFoldingIcons.forEach((region) => {
            const distanceToCenter = Math.sqrt(
                (canvasX - region.x) ** 2
                + (canvasY - region.y) ** 2,
            );

            if (distanceToCenter <= region.radius) {
                documentState.toggleChildrenVisibility(region.id);
            }
        });
    }

    /**
     * Handle mouse down events by treating them as the start of dragging the
     * document
     *
     * @param e The triggering event
     */
    function onMouseDown(e: MouseEvent) {
        dragStart(e.pageX, e.pageY);
    }

    /**
     * Handle mouse move events
     *
     * @param e The triggering event
     */
    function onMouseMove(e: MouseEvent) {
        dragMove(e.pageX, e.pageY);
    }

    /**
     * Handle mouse out events -- stop dragging so there's no weird dragging
     * behavior when mouse re-enters the canvas
     */
    function onMouseOut() {
        dragEnd();
    }

    /**
     * Handle mouse up events by turning off dragging
     */
    function onMouseUp() {
        dragEnd();
    }

    /**
     * Handle touch end events
     */
    function onTouchEnd() {
        dragEnd();
    }

    /**
     * Handle touch move events
     *
     * @param e The triggering event
     */
    function onTouchMove(e: TouchEvent) {
        dragMove(e.touches[0].pageX, e.touches[0].pageY);
    }

    /**
     * Handle touch start events. Treat them as the start of dragging the
     * document, and thus assume there is just one touch point
     *
     * @param e The triggering event
     */
    function onTouchStart(e: TouchEvent) {
        dragStart(e.touches[0].pageX, e.touches[0].pageY);
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

    /**
     * Render the specified node and all of it's children
     *
     * @param allDimensions The Map that has dimensions for every node in the
     *                      document
     * @param nodeId        The ID of the node to render first
     * @param bubblePos     The coordinates of the top left corner of this
     *                      node's bubble
     */
    function renderNodesRecursively(
        allDimensions: AllDimensions,
        nodeId: number,
        bubblePos: Coordinates,
    ) {
        const myDims = safeGetDimensions(allDimensions, nodeId);
        const childrenVisible = documentState.getChildrenVisible(nodeId);
        renderNodeContentsAndBubble(myDims, bubblePos, nodeId);

        const childIds = documentState.getNodeChildIds(nodeId);
        if (childIds.length > 0) {
            //------------------------------------------------------------------
            // Render the folding icon
            //------------------------------------------------------------------
            const foldingIconPos = {
                x: bubblePos.x + myDims.bubbleWidth + FOLDING_ICON_RADIUS,
                y: bubblePos.y + myDims.bubbleHeight / 2,
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
                const relativeChildYCoords = getNodesRelativeYCoordinates(
                    allDimensions,
                    myDims,
                    childIds,
                );

                childIds.forEach((childId, index) => {
                    renderChildConnector(
                        {
                            x: foldingIconPos.x + FOLDING_ICON_RADIUS,
                            y: foldingIconPos.y,
                        },
                        {
                            x: childrenX,
                            y: foldingIconPos.y + relativeChildYCoords[index].bubbleCenter,
                        },
                    );

                    renderNodesRecursively(
                        allDimensions,
                        childId,
                        {
                            x: childrenX,
                            y: foldingIconPos.y + relativeChildYCoords[index].bubbleTop,
                        },
                    );
                });
            }
        }
    }

    /**
     * Render the specified node's contents and bubble
     *
     * @param myDims    Dimension for the specified node
     * @param bubblePos The top left coordinates of the specified node's
     *                  bubble
     * @param nodeId    The ID of the node to render
     */
    function renderNodeContentsAndBubble(
        myDims: NodeDimensionInfo,
        bubblePos: Coordinates,
        nodeId: number,
    ) {
        // Remember that (x,y) for text is bottom left corner
        const linesForThisNode = getNodeLines(documentState.getNodeContents(nodeId));
        let textY = bubblePos.y + fontSize + NODE_PADDING.y / 2;

        linesForThisNode.forEach((line) => {
            ctx.fillText(
                line,
                bubblePos.x + NODE_PADDING.x,
                textY,
            );
            textY += fontSize + NODE_LINES_VERTICAL_PADDING;
        });

        // Style the bubble based on whether this node is selected
        if (documentState.getSelectedNodeId() === nodeId) {
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
        }

        roundedRectangle(
            bubblePos.x,
            bubblePos.y,
            myDims.bubbleWidth,
            myDims.bubbleHeight,
        );

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Record the region that should respond to clicks for this node
        clickableNodes.push(
            {
                id: nodeId,
                x: bubblePos.x,
                y: bubblePos.y,
                width: myDims.bubbleWidth,
                height: myDims.bubbleHeight,
            },
        );
    }

    /**
     * A wrapper for getting dimensions from allDimensions that throws an
     * exception if there is no key for the specified node.
     *
     * Useful because typescript says get() may returned undefined, but we
     * this will never be the case unless there's a bug.
     *
     * @param allDimensions A Map where the keys are nodeIds
     * @param nodeId        The node whose dimensions are to be returned
     * @returns DimensionInfo The info for the specified node
     */
    function safeGetDimensions(
        allDimensions: AllDimensions,
        nodeId: number,
    ): NodeDimensionInfo {
        const dimensions = allDimensions.get(nodeId);
        if (dimensions !== undefined) return dimensions;

        throw new Error(
            `safeGetDimensions(): nodeID '${nodeId}' is not present`,
        );
    }

    /**
     * Draw a rectangle with rounded corners. Coordinates and dimensions
     * correspond to a true (90 degree corner) rectangle.
     *
     * @param x      x-coordinate of top left corner
     * @param y      y-coordinate of top left corner
     * @param width  Width of the rectangle
     * @param height Height of the rectangle
     */
    function roundedRectangle(x: number, y: number, width: number, height: number) {
        const radius = 5;

        // Roughly speaking, here's a corner, with (x,y) marked by '+':
        //
        // +   ────  ┐
        //   /       ├ Radius
        //  /        ┘
        // |
        // |
        //
        // └┬─┘
        // Radius

        // Coordinates of corners as if this were a normal rectangle
        const topLeft = {
            x,
            y,
        };

        const topRight = {
            x: x + width,
            y,
        };

        const bottomLeft = {
            x,
            y: y + height,
        };

        const bottomRight = {
            x: x + width,
            y: y + height,
        };

        // Draw in a clockwise direction starting at top left
        ctx.beginPath();

        // Top left corner
        ctx.arc(
            topLeft.x + radius,
            topLeft.y + radius,
            radius,
            Math.PI,
            1.5 * Math.PI,
        );

        // Top line
        ctx.lineTo(topRight.x - radius, topRight.y);

        // Top right corner
        ctx.arc(
            topRight.x - radius,
            topRight.y + radius,
            radius,
            1.5 * Math.PI,
            2 * Math.PI,
        );

        // Right line
        ctx.lineTo(bottomRight.x, bottomRight.y - radius);

        // Bottom right corner
        ctx.arc(
            bottomRight.x - radius,
            bottomRight.y - radius,
            radius,
            0,
            0.5 * Math.PI,
        );

        // Bottom line
        ctx.lineTo(bottomLeft.x + radius, bottomLeft.y);

        // Bottom left corner
        ctx.arc(
            bottomLeft.x + radius,
            bottomLeft.y - radius,
            radius,
            0.5 * Math.PI,
            Math.PI,
        );

        // Left line
        ctx.lineTo(topLeft.x, topLeft.y + radius);

        // And done!
        ctx.stroke();
    }

    function saveDimensionsFromAttrs(attrs: Attrs) {
        currentDocDimensions.width = attrs.documentDimensions.width;
        currentDocDimensions.height = attrs.documentDimensions.height;
    }

    return {
        oncreate: (vnode) => {
            canvasElement = vnode.dom as HTMLCanvasElement;
            ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

            saveDimensionsFromAttrs(vnode.attrs);

            // Scale the canvas properly so everything looks crisp on high DPI
            // displays
            ctx.scale(devicePixelRatio, devicePixelRatio);

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px Barlow Regular`;

            const rootNodeId = documentState.getRootNodeId();
            const allDimensions = new Map();
            calculateDimensions(allDimensions, rootNodeId);

            renderNodesRecursively(
                allDimensions,
                rootNodeId,
                {
                    x: 10,
                    y: vnode.attrs.documentDimensions.height / 2,
                },
            );
        },

        onupdate: (vnode) => {
            if (vnode.attrs.performReset) {
                // Perform a reset of translation data due to a new document
                // having been loaded
                ctx.translate(
                    -cumulativeCanvasTranslation.x,
                    -cumulativeCanvasTranslation.y,
                );
                cumulativeCanvasTranslation.x = 0;
                cumulativeCanvasTranslation.y = 0;
            }

            fontSize = uiState.getCurrentFontSize();

            // Canvas elements reset their scale and translation when their
            // dimensions change, so reset when that happens
            if (
                currentDocDimensions.width !== vnode.attrs.documentDimensions.width ||
                currentDocDimensions.height !== vnode.attrs.documentDimensions.height
            ) {
                saveDimensionsFromAttrs(vnode.attrs);

                ctx.scale(devicePixelRatio, devicePixelRatio);
                ctx.translate(
                    cumulativeCanvasTranslation.x,
                    cumulativeCanvasTranslation.y,
                );
            }

            // Clear the existing rendered map
            // We need to clear a region larger than the actual canvas so
            // parts of the map rendered prior to a translation also get cleared
            //
            // I don't fully understand why this works, but it needs to be
            // big to handle gigantically wide nodes
            const MAX_PREV_TRANSLATION = 4000;
            ctx.clearRect(
                -MAX_PREV_TRANSLATION,
                -MAX_PREV_TRANSLATION,
                vnode.attrs.documentDimensions.width + 2 * MAX_PREV_TRANSLATION,
                vnode.attrs.documentDimensions.height + 2 * MAX_PREV_TRANSLATION,
            );

            // Reset clickable regions
            clickableFoldingIcons = [];
            clickableNodes = [];

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px Barlow Regular`;

            const rootNodeId = documentState.getRootNodeId();
            const allDimensions = new Map();
            calculateDimensions(allDimensions, rootNodeId);

            renderNodesRecursively(
                allDimensions,
                rootNodeId,
                {
                    x: 10,
                    y: vnode.attrs.documentDimensions.height / 2,
                },
            );
        },

        view: ({ attrs }) => {
            const cssPixelsWidth = attrs.documentDimensions.width;
            const cssPixelsHeight = attrs.documentDimensions.height;

            // Set actual width and height to be used by the browser's drawing
            // engine (i.e. use the full device resolution)
            // This relies on the canvas context also being scaled by the
            // devicePixelRatio (in oncreate and onupdate)
            const canvasActualWidth = cssPixelsWidth * devicePixelRatio;
            const canvasActualHeight = cssPixelsHeight * devicePixelRatio;

            // Event handlers trigger Mithril redraws. So only define
            // movement handlers if a redraw is actually going to be required.

            const handlers = {
                onclick: onClick,

                onmousedown: onMouseDown,
                onmousemove: dragging ? onMouseMove : undefined,
                onmouseout: dragging ? onMouseOut : undefined,
                onmouseup: onMouseUp,

                ontouchend: onTouchEnd,
                ontouchmove: dragging ? onTouchMove : undefined,
                ontouchstart: onTouchStart,
            };

            return m(
                'canvas',
                {
                    width: canvasActualWidth,
                    height: canvasActualHeight,
                    style: {
                        border: '1px solid black',
                        width: `${cssPixelsWidth}px`,
                        height: `${cssPixelsHeight}px`,
                    },
                    ...handlers,
                },
            );
        },
    };
}

export default DisplayedDocument;
