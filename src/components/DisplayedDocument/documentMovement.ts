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
 *          getCanvasEventHandlers Event handlers that will handle moving the
 *                                 canvas due to user interactions
 *          resetDocTranslation    Reset the document's translation in the canvas
 */
export function getDocumentMovementHelpers(
    translateCanvas: (deltaX: number, deltaY: number) => void,
    docRelativeClickHandler: (clickX: number, clickY: number) => void,
): {
    getCanvasEventHandlers: () => Partial<GlobalEventHandlers>,
    resetDocTranslation: () => void,
} {
    let docIsBeingDragged = false;

    // Coordinates of the mouse/pointer at previous translation event
    let previousPointerCoords = {
        x: 0,
        y: 0,
    };

    const cumulativeCanvasTranslation = {
        x: 0,
        y: 0,
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
        docIsBeingDragged = true;
        previousPointerCoords = { x, y };
    }

    function dragMove(x: number, y: number) {
        if (!docIsBeingDragged) return;

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

        translateCanvas(deltaX, deltaY);
    }

    function dragEnd() { docIsBeingDragged = false; }

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
            ...(docIsBeingDragged ? onlyDraggingModeHandlers : {}),
        };
    }

    return {
        getCanvasEventHandlers,
        resetDocTranslation,
    };
}
