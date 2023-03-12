// Copyright 2023 Glen Reesor
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

import { Coordinates, Dimensions } from '../types';

type MovementState = 'none' | 'userDragging' | 'inertiaScroll';

export default (
    (): {
        getRootNodeCoords: () => Coordinates,
        resetRootNodeCoords: () => void,
        setRootNodeCoords: (newCoords: Coordinates) => void,
        translateRootNode: (dx: number, dy: number) => void,

        getMovementState: () => MovementState,
        handleUserDragStart: (pointerCoords: Coordinates) => void,
        handleUserDragMovement: (newPointerCoords: Coordinates) => void,
        handleUserDragStop: (redrawDocument: () => void) => void,

        setCanvasDimensions: (dimensions: Dimensions) => void,
    } => {
        let canvasDimensions: Dimensions = { width: 0, height: 0 };
        let rootNodeCoords: Coordinates = { x: 0, y: 0 };

        let movementState: MovementState = 'none';

        let userDragging = {
            previousEventTime: 0,
            previousEventPointerCoords: { x: 0, y: 0 },
            previousVelocity: { x: 0, y: 0 },
            previousPreviousVelocity: { x: 0, y: 0 },
        };

        let inertiaScroll = {
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            startVelocity: { x: 0, y: 0 },
            previousPosition: { x: 0, y: 0 },
        };

        /**
         * Scroll the document using inertia calculation based on velocity when
         * user stopped dragging
         */
        function performInertiaScroll(redrawDocument: () => void) {
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

            translateDocument(deltaX, deltaY);

            inertiaScroll.previousPosition.x += deltaX;
            inertiaScroll.previousPosition.y += deltaY;

            redrawDocument();

            if (Math.abs(deltaX / t) > 0.0005 || Math.abs(deltaY / t) > 0.0005) {
                window.requestAnimationFrame(
                    () => performInertiaScroll(redrawDocument),
                );
            } else {
                movementState = 'none';
            }
        }

        function translateDocument(dx: number, dy: number) {
            rootNodeCoords = {
                x: rootNodeCoords.x + dx,
                y: rootNodeCoords.y + dy,
            };
        }

        return {
            getRootNodeCoords: () => rootNodeCoords,

            getMovementState: () => movementState,

            handleUserDragStart: (pointerCoords: Coordinates) => {
                movementState = 'userDragging';
                userDragging = {
                    previousEventTime: Date.now(),
                    previousEventPointerCoords: {
                        x: pointerCoords.x,
                        y: pointerCoords.y,
                    },
                    previousVelocity: { x: 0, y: 0 },
                    previousPreviousVelocity: { x: 0, y: 0 },
                };
            },

            handleUserDragMovement: (newPointerCoords: Coordinates) => {
                if (movementState !== 'userDragging') return;

                // Calculate how much the pointer moved
                const dx = newPointerCoords.x - userDragging.previousEventPointerCoords.x;
                const dy = newPointerCoords.y - userDragging.previousEventPointerCoords.y;

                // Apply this translation to the document (we rely on Mithril redrawing
                // after this handler completes)
                translateDocument(dx, dy);

                const now = Date.now();
                const deltaT = now - userDragging.previousEventTime;

                userDragging = {
                    previousEventTime: now,
                    previousEventPointerCoords: {
                        x: newPointerCoords.x,
                        y: newPointerCoords.y,
                    },
                    previousVelocity: { x: dx / deltaT, y: dy / deltaT },
                    previousPreviousVelocity: {
                        x: userDragging.previousVelocity.x,
                        y: userDragging.previousVelocity.y,
                    },
                };
            },

            handleUserDragStop: (redrawDocument: () => void) => {
                movementState = 'inertiaScroll';

                inertiaScroll = {
                    startTime: Date.now(),
                    startPosition: {
                        x: userDragging.previousEventPointerCoords.x,
                        y: userDragging.previousEventPointerCoords.y,
                    },

                    // The last velocity on a touch device can vary significantly
                    // from previous ones and thus provide an eratic user experience,
                    // so don't use it
                    startVelocity: {
                        x: userDragging.previousPreviousVelocity.x,
                        y: userDragging.previousPreviousVelocity.y,
                    },
                    previousPosition: {
                        x: userDragging.previousEventPointerCoords.x,
                        y: userDragging.previousEventPointerCoords.y,
                    },
                };

                window.requestAnimationFrame(
                    () => performInertiaScroll(redrawDocument),
                );
            },

            resetRootNodeCoords: () => {
                rootNodeCoords = {
                    x: 10,
                    y: canvasDimensions.height / 2,
                };
            },

            setCanvasDimensions: (dimensions: Dimensions) => {
                canvasDimensions = { ...dimensions };
            },

            setRootNodeCoords: (newCoords: Coordinates) => {
                rootNodeCoords = { ...newCoords };
            },

            translateRootNode: (dx: number, dy: number) => {
                translateDocument(dx, dy);
            },
        };
    }
)();
