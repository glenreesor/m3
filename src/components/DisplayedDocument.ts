import * as m from 'mithril';
import documentState from '../state/documentState';

interface Attrs {
    documentDimensions: {
        height: number,
        width: number,
    },
}

/**
 * A component to render the user's document in a <canvas> element
 *
 * @returns An object to be consumed by m()
 */
function DisplayedDocument(): m.Component<Attrs> {
    interface DimensionInfo {
        // The height of the node's bubble
        bubbleHeight: number,

        // The width of the node's bubble
        bubbleWidth: number,

        // Total height of this node and its visible children
        totalHeight: number,
    }

    type AllDimensions = Map<number, DimensionInfo>;

    // Description of a rectangular region that should be clickable
    interface ClickableRegion {
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
    const FONT_SIZE = 12;

    const NODE_PADDING = {
        x: 5,
        y: 5,
    };

    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    // List of clickable regions for nodes (created upon each render)
    let clickableNodes: ClickableRegion[] = [];

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
        const textMetrics = ctx.measureText(
            documentState.getNodeContents(nodeId),
        );
        const bubbleDim = {
            h: FONT_SIZE + 2 * NODE_PADDING.y,
            w: textMetrics.width + 2 * NODE_PADDING.x,
        };
        const childIds = documentState.getNodeChildIds(nodeId);

        // Determine total height of this node's children
        let totalChildrenHeight = 0;

        childIds.forEach((childId) => {
            calculateDimensions(allDimensions, childId);
            totalChildrenHeight += safeGetDimensions(
                allDimensions, childId,
            ).totalHeight;
        });

        // Also account for vertical padding between child nodes
        if (childIds.length > 0) {
            totalChildrenHeight += (childIds.length - 1) * CHILD_PADDING.y;
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
                totalHeight: Math.max(bubbleDim.h, totalChildrenHeight),
            },
        );
    }

    /**
     * Handle a click or tap on this canvas. Compare the clicked coordinates
     * to our clickable regions and handle as appropriate.
     *
     * @param e The mouse event corresponding to the click
     */
    function onClick(e: MouseEvent) {
        // Convert the mouse coordinates to be relative to the canvas
        const canvasX = e.pageX - canvasElement.offsetLeft;
        const canvasY = e.pageY - canvasElement.offsetTop;

        clickableNodes.forEach((region) => {
            if (
                (canvasX >= region.x && canvasX <= region.x + region.width)
                && (canvasY >= region.y && canvasY <= region.y + region.height)
            ) {
                documentState.setSelectedNodeId(region.id);
            }
        });
    }
    /**
     * Render the specified node and all of it's children
     *
     * @param allDimensions   The Map that has entries for every node in the
     *                        document
     * @param nodeId          The ID of the node to render
     * @param bubblePos       The coordinates of the top left corner of this
     *                        node's bubble
     * @param     bubblePos.x     The x-coordinate
     * @param     bubblePos.y     The y-coordinate
     */
    function renderNode(
        allDimensions: AllDimensions,
        nodeId: number,
        bubblePos: {x: number, y: number},
    ) {
        //----------------------------------------------------------------------
        // Render the specified node's contents and bubble
        //----------------------------------------------------------------------
        const myDims = safeGetDimensions(allDimensions, nodeId);

        // Remember that (x,y) for text is bottom left corner
        ctx.fillText(
            documentState.getNodeContents(nodeId),
            bubblePos.x + NODE_PADDING.x,
            bubblePos.y + myDims.bubbleHeight - NODE_PADDING.y,
        );

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
            ctx.stroke();

            //------------------------------------------------------------------
            // Calculate coordinates for this node's first child
            //------------------------------------------------------------------

            // Children are centered vertically on this, the parent node:
            //                 ┌──────────────────────────────┐
            //                 |                              |
            // ┌──────────┐    |                              |
            // |parentNode|    |         All Children         |
            // └──────────┘    |                              |
            //                 |                              |
            //                 └──────────────────────────────┘

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

            // - x-coordinate won't change for any children
            // - y-coordinate will be updated for each child
            const childTop = {
                // x-coordinate of children is easy as they're all lined up
                x: foldingIconPos.x + FOLDING_ICON_RADIUS + CHILD_PADDING.x,

                // Children are centered (vertically) on parent node, so
                // y-coordinate of first child is half the total children height
                // above parent
                y: (
                    bubblePos.y + myDims.bubbleHeight / 2 // Vertical center of parent
                    - myDims.totalHeight / 2
                ),
            };

            //------------------------------------------------------------------
            // Render each child and connector
            //------------------------------------------------------------------
            childIds.forEach((childId) => {
                // Render the child
                const thisChildDims = safeGetDimensions(allDimensions, childId);
                const thisChildCenter = childTop.y + 0.5 * thisChildDims.totalHeight;

                // Remember y-coordinates are for the top of the bubble, which
                // is not the vertical center of the node
                const thisChildY = (
                    thisChildCenter - thisChildDims.bubbleHeight / 2
                );
                renderNode(
                    allDimensions,
                    childId,
                    {
                        x: childTop.x,
                        y: thisChildY,
                    },
                );

                // Render the connector
                const curveStart = {
                    x: foldingIconPos.x + FOLDING_ICON_RADIUS,
                    y: foldingIconPos.y,
                };

                const curveEnd = {
                    x: childTop.x,
                    y: thisChildY + NODE_PADDING.y + FONT_SIZE / 2,
                };

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

                // Adjust y-coordinate for next child
                childTop.y += thisChildDims.totalHeight + CHILD_PADDING.y;
            });
        }
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
     *
     * @returns DimensionInfo The info for the specified node
     */
    function safeGetDimensions(
        allDimensions: AllDimensions,
        nodeId: number,
    ): DimensionInfo {
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

    return {
        oncreate: (vnode) => {
            //------------------------------------------------------------------
            // Scale the canvas properly so everything looks crisp on high DPI
            // displays
            //------------------------------------------------------------------
            canvasElement = vnode.dom as HTMLCanvasElement;
            const cssPixelsBoundingRect = canvasElement.getBoundingClientRect();
            const devicePixelRatio = window.devicePixelRatio || 1;
            ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

            // Set actual width and height to be used by the browser's drawing
            // engine (i.e. use the full device resolution)
            canvasElement.width = cssPixelsBoundingRect.width * devicePixelRatio;
            canvasElement.height = cssPixelsBoundingRect.height * devicePixelRatio;

            // At this point the canvas may be bigger than the available CSS
            // pixels (if this is a high DPI device), so scale it back down to
            // the required CSS pixel dimensions
            canvasElement.style.width = `${cssPixelsBoundingRect.width}px`;
            canvasElement.style.height = `${cssPixelsBoundingRect.height}px`;

            // Since the canvas size is in terms of device pixels but drawing
            // commands are in terms of CSS pixels, we must scale drawing
            // commands
            ctx.scale(devicePixelRatio, devicePixelRatio);

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${FONT_SIZE}px sans-serif`;

            const rootNodeId = documentState.getRootNodeId();
            const allDimensions = new Map();
            calculateDimensions(allDimensions, rootNodeId);

            renderNode(
                allDimensions,
                rootNodeId,
                {
                    x: 10,
                    y: vnode.attrs.documentDimensions.height / 2,
                },
            );
        },

        onupdate: (vnode) => {
            // Clear the existing rendered map
            ctx.clearRect(
                0,
                0,
                vnode.attrs.documentDimensions.width,
                vnode.attrs.documentDimensions.height,
            );

            // Reset clickable regions
            clickableNodes = [];

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${FONT_SIZE}px sans-serif`;

            const rootNodeId = documentState.getRootNodeId();
            const allDimensions = new Map();
            calculateDimensions(allDimensions, rootNodeId);

            renderNode(
                allDimensions,
                rootNodeId,
                {
                    x: 10,
                    y: vnode.attrs.documentDimensions.height / 2,
                },
            );
        },

        view: ({ attrs }) => m(
            'canvas',
            {
                height: attrs.documentDimensions.height,
                width: attrs.documentDimensions.width,
                style: 'border: 1px solid black',
                onclick: onClick,
            },
        ),
    };
}

export default DisplayedDocument;
