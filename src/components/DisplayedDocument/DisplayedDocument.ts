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
import documentState from '../../state/documentState';
import uiState from '../../state/uiState';

import { getDocumentMovementHelpers } from './documentMovement';
import {
    onCanvasClick,
    renderDocument,
    resetClickableRegions,
} from './layout';

interface Attrs {
    documentDimensions: {
        height: number,
        width: number,
    },
    performReset: boolean,
}

/**
 * A component to render the user's document in a <canvas> element
 */
function DisplayedDocument(): m.Component<Attrs> {
    const documentMovementHelpers = getDocumentMovementHelpers({
        translateCanvas,
        docRelativeClickHandler: onCanvasClick,
    });

    const devicePixelRatio = window.devicePixelRatio || 1;

    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const currentDocDimensions = {
        width: -1,
        height: -1,
    };

    function saveDimensionsFromAttrs(attrs: Attrs) {
        currentDocDimensions.width = attrs.documentDimensions.width;
        currentDocDimensions.height = attrs.documentDimensions.height;
    }

    function translateCanvas(x: number, y: number) {
        ctx.translate(x, y);
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
            const fontSize = uiState.getCurrentFontSize();
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px sans-serif`;

            const rootNodeId = documentState.getRootNodeId();

            renderDocument({
                ctx,
                fontSize,
                rootNodeId,
                canvasDimensions: vnode.attrs.documentDimensions,
            });
        },

        onupdate: (vnode) => {
            if (vnode.attrs.performReset) {
                // Perform a reset of translation data due to a new document
                // having been loaded
                documentMovementHelpers.resetDocTranslation();
            }

            const fontSize = uiState.getCurrentFontSize();

            // Canvas elements reset their scale and translation when their
            // dimensions change, so reset when that happens
            if (
                currentDocDimensions.width !== vnode.attrs.documentDimensions.width ||
                currentDocDimensions.height !== vnode.attrs.documentDimensions.height
            ) {
                saveDimensionsFromAttrs(vnode.attrs);

                ctx.scale(devicePixelRatio, devicePixelRatio);
                documentMovementHelpers.resetDocTranslation();
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
            resetClickableRegions();

            //------------------------------------------------------------------
            // Draw the user's map
            //------------------------------------------------------------------
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#000000';
            ctx.font = `${fontSize}px sans-serif`;

            const rootNodeId = documentState.getRootNodeId();

            renderDocument({
                ctx,
                fontSize,
                rootNodeId,
                canvasDimensions: vnode.attrs.documentDimensions,
            });
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

            // Event handlers trigger Mithril redraws (of the entire app).
            // So only define movement handlers if we actually need them, which
            // is when the document is being dragged by the user.
            const { alwaysActiveHandlers } = documentMovementHelpers;
            const optionalDraggingHandlers = documentMovementHelpers.getDocIsBeingDragged()
                ? documentMovementHelpers.onlyDraggingModeHandlers
                : {};

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
                    ...alwaysActiveHandlers,
                    ...optionalDraggingHandlers,
                },
            );
        },
    };
}

export default DisplayedDocument;
