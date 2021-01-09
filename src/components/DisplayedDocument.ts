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
        // The height of the node's contents (i.e. excluding bubble)
        nodeContentsHeight: number,

        // The width of the node's contents
        nodeContentsWidth: number,

        // Total height of this node and its visible children
        totalHeight: number,
    }

    type AllDimensions = Map<number, DimensionInfo>;

    // Our drawing context
    let ctx: CanvasRenderingContext2D;

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
        const myContentsWidth = textMetrics.width;
        const myContentsHeight = 12 * 1.5;

        // Determine total height of this node's children
        let totalChildrenHeight = 0;

        documentState.getNodeChildIds(nodeId).forEach((childId) => {
            calculateDimensions(allDimensions, childId);
            totalChildrenHeight += safeGetDimensions(
                allDimensions, childId,
            ).totalHeight;
        });

        // We have all the required dimensions, so store them.
        // Note that even if there are multiple children, the contents of the
        // current node may still be higher than all the children, hence
        // the Math.max() below.
        allDimensions.set(
            nodeId,
            {
                nodeContentsHeight: myContentsHeight,
                nodeContentsWidth: myContentsWidth,
                totalHeight: Math.max(myContentsHeight, totalChildrenHeight),
            },
        );
    }

    /**
     * Render the specified node and all of it's children
     *
     * @param allDimensions   The Map that has entries for every node in the
     *                        document
     * @param nodeId          The ID of the node to render
     * @param x               The x-coordinate for this node
     * @param y               The y-coordinate for this node
     */
    function renderNode(
        allDimensions: AllDimensions,
        nodeId: number,
        x: number,
        y: number,
    ) {
        //----------------------------------------------------------------------
        // Render the specified node's contents
        //----------------------------------------------------------------------
        ctx.fillText(documentState.getNodeContents(nodeId), x, y);

        const children = documentState.getNodeChildIds(nodeId);
        if (children.length > 0) {
            //------------------------------------------------------------------
            // Render this node's children
            //------------------------------------------------------------------

            // Children are centered vertically on this, the parent node:
            //                 +-------------------------------------------+
            //                 |                                           |
            // +----------+    |                                           |
            // |parentNode|    |            All Children                   |
            // +----------+    |                                           |
            //                 |                                           |
            //                 +-------------------------------------------+

            // The top of the first child (and all of it's children) is at the
            // top of the box shown above.
            // The top of the second child (and all of it's children) is below
            // that.
            // And so on.
            //  +-------------------------------------------+
            //  |     +-------------------------+           |
            //  |     |           Grandchild 1  |           |
            //  |     |  Child 1  Grandchild 2  |           |
            //  |     |           Grandchild 3  |           |
            //  |     +-------------------------+           |
            //  |                                           |
            //  |     +-------------------------+           |
            //  |     |           Grandchild 1  |           |
            //  |     |  Child 1  Grandchild 2  |           |
            //  |     |           Grandchild 3  |           |
            //  |     +-------------------------+           |
            //  +-------------------------------------------+
            const myDimensions = safeGetDimensions(allDimensions, nodeId);

            // x-coordinate of children is easy as they're all lined up
            const childrenX = x + myDimensions.nodeContentsWidth + 10;

            // Children are centered (vertically) on parent node, so y-coordinate
            // of first child is half the total children height above parent
            let childrenY = y - 0.5 * myDimensions.totalHeight;

            // Render each child
            children.forEach((childId) => {
                const thisChildTotalHeight = safeGetDimensions(
                    allDimensions,
                    childId,
                ).totalHeight;

                renderNode(
                    allDimensions,
                    childId,
                    childrenX,
                    childrenY + 0.5 * thisChildTotalHeight,
                );
                childrenY += thisChildTotalHeight;
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

    return {
        oncreate: (vnode) => {
            //------------------------------------------------------------------
            // Scale the canvas properly so everything looks crisp on high DPI
            // displays
            //------------------------------------------------------------------
            const canvasElement = vnode.dom as HTMLCanvasElement;
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
            // Now draw things
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = '12px sans-serif';

            const rootNodeId = documentState.getRootNodeId();
            const allDimensions = new Map();
            calculateDimensions(allDimensions, rootNodeId);

            renderNode(
                allDimensions,
                rootNodeId,
                10,
                vnode.attrs.documentDimensions.height / 2,
            );
        },

        view: ({ attrs }) => m(
            'canvas',
            {
                height: attrs.documentDimensions.height,
                width: attrs.documentDimensions.width,
                style: 'border: 1px solid black',
            },
        ),
    };
}

export default DisplayedDocument;
