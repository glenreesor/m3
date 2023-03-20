// Copyright 2022, 2023 Glen Reesor
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
import canvasState from '../../state/canvasState';
import documentState from '../../state/documentState';
import uiState from '../../state/uiState';

import {
    onCanvasClick,
    renderDocument,
} from './layout';

interface Attrs {
    documentDimensions: {
        height: number,
        width: number,
    },
}

/**
 * A component to render the user's document in a <canvas> element
 */
function DisplayedDocument(): m.Component<Attrs> {
    const devicePixelRatio = window.devicePixelRatio || 1;

    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const currentCanvasDimensions = {
        width: -1,
        height: -1,
    };

    function getCanvasEventHandlers() {
        // Event handlers trigger Mithril redraws (of the entire app).
        // So only define movement handlers if we actually need them, which
        // is when the document is being dragged by the user.
        const alwaysActiveHandlers = {
            onclick: (e: MouseEvent) => {
                onCanvasClick(e.offsetX, e.offsetY);
            },
            onmousedown: (e: MouseEvent) => {
                canvasState.handleUserDragStart({
                    x: e.pageX,
                    y: e.pageY,
                });
            },
            ontouchstart: (e: TouchEvent) => {
                canvasState.handleUserDragStart({
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY,
                });
            },
        };

        const onlyDraggingModeHandlers = {
            onmousemove: (e: MouseEvent) => {
                canvasState.handleUserDragMovement({
                    x: e.pageX,
                    y: e.pageY,
                });
            },
            onmouseout: canvasState.handleUserDragStop,
            onmouseup: canvasState.handleUserDragStop,
            ontouchend: canvasState.handleUserDragStop,
            ontouchmove: (e: TouchEvent) => {
                canvasState.handleUserDragMovement({
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY,
                });
            },
        };

        return {
            ...alwaysActiveHandlers,
            ...(
                canvasState.getMovementState() === 'userDragging'
                    ? onlyDraggingModeHandlers
                    : {}
            ),
        };
    }

    function saveCanvasDimensionsFromAttrs(attrs: Attrs) {
        currentCanvasDimensions.width = attrs.documentDimensions.width;
        currentCanvasDimensions.height = attrs.documentDimensions.height;
    }

    function redrawCanvas() {
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
            currentCanvasDimensions.width + 2 * MAX_PREV_TRANSLATION,
            currentCanvasDimensions.height + 2 * MAX_PREV_TRANSLATION,
        );

        //------------------------------------------------------------------
        // Draw the user's map
        //------------------------------------------------------------------
        const fontSize = uiState.getCurrentFontSize();
        const rootNodeId = documentState.getRootNodeId();

        renderDocument(
            ctx,
            fontSize,
            rootNodeId,
            {
                width: currentCanvasDimensions.width,
                height: currentCanvasDimensions.height,
            },
        );
    }

    return {
        oncreate: (vnode) => {
            canvasState.setRedrawFunction(redrawCanvas);
            canvasElement = vnode.dom as HTMLCanvasElement;
            ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

            saveCanvasDimensionsFromAttrs(vnode.attrs);

            // Scale the canvas properly so everything looks crisp on high DPI
            // displays
            ctx.scale(devicePixelRatio, devicePixelRatio);

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            const fontSize = uiState.getCurrentFontSize();
            const rootNodeId = documentState.getRootNodeId();

            renderDocument(
                ctx,
                fontSize,
                rootNodeId,
                vnode.attrs.documentDimensions,
            );
        },

        onupdate: (vnode) => {
            // Canvas elements reset their scale and translation when their
            // dimensions change, so reset when that happens
            if (
                currentCanvasDimensions.width !== vnode.attrs.documentDimensions.width ||
                currentCanvasDimensions.height !== vnode.attrs.documentDimensions.height
            ) {
                saveCanvasDimensionsFromAttrs(vnode.attrs);

                ctx.scale(devicePixelRatio, devicePixelRatio);
                canvasState.resetRootNodeCoords();
            }

            redrawCanvas();
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
                    ...getCanvasEventHandlers(),
                },
            );
        },
    };
}

export default DisplayedDocument;
