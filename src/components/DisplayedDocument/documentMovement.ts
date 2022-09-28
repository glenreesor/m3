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

/**
 * Get event handlers and related helper functions for implementing document
 * movement (dragging).
 *
 * @param translateCanvas         A function accepting (deltaX, deltaY) that will translate
 *                                the canvas by the specified amount
 * @param docRelativeClickHandler A function accepting (x, y) that will be called
 *                                for each click event, where (x, y) are relative
 *                                to the current document (i.e. calling code
 *                                does not have to be aware of canvas translations)
 *
 * @returns An object with the following keys:
 *
 *          getCanvasEventHandlers Event handlers that will handle user interactions
 *                                 to move the document
 *          resetDocTranslation    Reset the document's translation in the
 *                                 canvas
 */
export function getDocumentMovementHelpers(
    translateCanvas: (deltaX: number, deltaY: number) => void,
    docRelativeClickHandler: (clickX: number, clickY: number) => void,
    redrawCanvas: () => void,
): {
    getCanvasEventHandlers: () => Partial<GlobalEventHandlers>,
    resetDocTranslation: () => void,
} {
    let movementState: 'none' | 'userDragging' | 'inertiaScroll' = 'none';

    const cumulativeCanvasTranslation = {
        x: 0,
        y: 0,
    };

    let userDragging = {
        previousEventTime: 0,
        previousEventPointerCoords: { x: 0, y: 0 },
        previousVelocity: { x: 0, y: 0 },
    };

    let inertiaScroll = {
        startTime: 0,
        startPosition: { x: 0, y: 0 },
        startVelocity: { x: 0, y: 0 },
        previousPosition: { x: 0, y: 0 },
    };

    //-------------------------------------------------------------------------
    // Mouse handlers that call appropriate functions based on whether document
    // is being dragged or not
    //-------------------------------------------------------------------------
    function onMouseDown(e: MouseEvent) {
        dragStart(e.pageX, e.pageY);
    }

    function onMouseUp() {
        dragEnd();
    }

    function onMouseMove(e: MouseEvent) {
        dragMove(e.pageX, e.pageY);
    }

    function onMouseOut() {
        dragEnd();
    }

    //-------------------------------------------------------------------------
    // Touch handlers that call appropriate functions based on whether document
    // is being dragged or not
    //-------------------------------------------------------------------------
    function onTouchMove(e: TouchEvent) {
        dragMove(e.touches[0].pageX, e.touches[0].pageY);
    }

    function onTouchEnd() {
        dragEnd();
    }

    function onTouchStart(e: TouchEvent) {
        dragStart(e.touches[0].pageX, e.touches[0].pageY);
    }

    //-------------------------------------------------------------------------
    // Functions to handle dragging the document
    //-------------------------------------------------------------------------
    function dragStart(x: number, y: number) {
        movementState = 'userDragging';
        userDragging = {
            previousEventTime: Date.now(),
            previousEventPointerCoords: { x, y },
            previousVelocity: { x: 0, y: 0 },
        };
    }

    function dragMove(x: number, y: number) {
        if (movementState !== 'userDragging') return;

        // Calculate how much the pointer moved
        const deltaX = x - userDragging.previousEventPointerCoords.x;
        const deltaY = y - userDragging.previousEventPointerCoords.y;

        // Apply this translation to the canvas (we rely on Mithril redrawing
        // after this handler completes)
        translateCanvas(deltaX, deltaY);

        // Update the total amount the canvas has been translated so we can
        // take that into account for click targets
        cumulativeCanvasTranslation.x += deltaX;
        cumulativeCanvasTranslation.y += deltaY;

        const now = Date.now();
        const deltaT = now - userDragging.previousEventTime;

        userDragging = {
            previousEventTime: now,
            previousEventPointerCoords: { x, y },
            previousVelocity: { x: deltaX / deltaT, y: deltaY / deltaT },
        };
    }

    function dragEnd() {
        movementState = 'inertiaScroll';

        inertiaScroll = {
            startTime: Date.now(),
            startPosition: {
                x: userDragging.previousEventPointerCoords.x,
                y: userDragging.previousEventPointerCoords.y,
            },
            startVelocity: {
                x: userDragging.previousVelocity.x,
                y: userDragging.previousVelocity.y,
            },
            previousPosition: {
                x: userDragging.previousEventPointerCoords.x,
                y: userDragging.previousEventPointerCoords.y,
            },
        };

        window.requestAnimationFrame(performInertiaScroll);
    }

    function performInertiaScroll() {
        if (movementState !== 'inertiaScroll') {
            return;
        }

        // Inspired by
        // http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
        //
        // Start with an exponential function of the form:
        //  d(t) = -a*e^(-b*t) + k    (a > 0, b > 0, k > 0)
        //
        // This provides a curve like this:
        //    d
        //    ^                    xxxxxxx
        //    |              xxxxxx
        //    |         xxxxx
        //    |     xxxx
        //    |  xxx
        //    |xx
        //    x
        // --x+-------------------------------> t
        //  x |
        //  x |
        //    |
        //
        // When user stops dragging (t=0), we know d(0) and v(0) so can solve
        // for 2 unknowns.
        //
        // 'b' controls how quickly the curve approaches its horizontal
        // asymptote, so we hard-code that as a tuning constant
        //
        // Solving for a and k:
        //  a = v(0) / b
        //  k = d(0) + a
        //
        // Substitute into the original function to get:
        //  d(t) = -[v0 / b ] * e^(-b*t) + [ d0 + v0 / b]
        //       = v0/b * [-e^(-b*t) + 1 ] + d0
        //
        // Use this derivation for each of horizontal and vertical directions

        const b = 0.002;

        const now = Date.now();
        const t = now - inertiaScroll.startTime;

        // In variables below, d0 and v0 correspond to d(0) and v(0)
        const d0x = inertiaScroll.startPosition.x;
        const v0x = inertiaScroll.startVelocity.x;
        const newX = v0x / b * (-1 * Math.exp(-1 * b * t) + 1) + d0x;

        const d0y = inertiaScroll.startPosition.y;
        const v0y = inertiaScroll.startVelocity.y;
        const newY = v0y / b * (-1 * Math.exp(-1 * b * t) + 1) + d0y;

        const deltaX = newX - inertiaScroll.previousPosition.x;
        const deltaY = newY - inertiaScroll.previousPosition.y;

        cumulativeCanvasTranslation.x += deltaX;
        cumulativeCanvasTranslation.y += deltaY;

        translateCanvas(deltaX, deltaY);

        inertiaScroll.previousPosition.x += deltaX;
        inertiaScroll.previousPosition.y += deltaY;

        redrawCanvas();

        if (Math.abs(deltaX / t) > 0.0005 || Math.abs(deltaY / t) > 0.0005) {
            window.requestAnimationFrame(performInertiaScroll);
        } else {
            movementState = 'none';
        }
    }

    //-------------------------------------------------------------------------
    // Click handler that calls the calling-code-supplied click handler with
    // (x, y) adjusted by the current translation amount, so calling code need
    // not be aware of canvas translations.
    //-------------------------------------------------------------------------
    function onClick(e: MouseEvent) {
        docRelativeClickHandler(
            e.offsetX - cumulativeCanvasTranslation.x,
            e.offsetY - cumulativeCanvasTranslation.y,
        );
    }

    //-------------------------------------------------------------------------
    function resetDocTranslation() {
        translateCanvas(
            -cumulativeCanvasTranslation.x,
            -cumulativeCanvasTranslation.y,
        );
        cumulativeCanvasTranslation.x = 0;
        cumulativeCanvasTranslation.y = 0;
    }

    function getCanvasEventHandlers() {
        // Event handlers trigger Mithril redraws (of the entire app).
        // So only define movement handlers if we actually need them, which
        // is when the document is being dragged by the user.
        const alwaysActiveHandlers = {
            onclick: onClick,
            onmousedown: onMouseDown,
            onmouseup: onMouseUp,
            ontouchend: onTouchEnd,
            ontouchstart: onTouchStart,
        };

        const onlyDraggingModeHandlers = {
            onmousemove: onMouseMove,
            onmouseout: onMouseOut,
            ontouchmove: onTouchMove,
        };

        return {
            ...alwaysActiveHandlers,
            ...(movementState === 'userDragging' ? onlyDraggingModeHandlers : {}),
        };
    }

    return {
        getCanvasEventHandlers,
        resetDocTranslation,
    };
}
