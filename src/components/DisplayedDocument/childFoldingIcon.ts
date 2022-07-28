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

import { CircularRegion, Coordinates } from './types';

export const CHILD_FOLDING_ICON_RADIUS = 10;

interface RenderChildFoldingIconArgs {
    ctx: CanvasRenderingContext2D,
    centerLeftCoordinates: Coordinates;
    childrenAreVisible: boolean;
}

/**
 * Render a child folding icon at the specified location.
 *
 *          o  o
 *       o        o
 *      o          o
 *  ┌─► o          o
 *  │   o          o
 *  │    o        o
 *  │       o  o
 *  │
 *  └───── centerLeftCoordinates
 */
export function renderChildFoldingIcon({
    ctx,
    centerLeftCoordinates,
    childrenAreVisible,
}: RenderChildFoldingIconArgs): CircularRegion {
    ctx.beginPath();
    ctx.arc(
        centerLeftCoordinates.x + CHILD_FOLDING_ICON_RADIUS,
        centerLeftCoordinates.y,
        CHILD_FOLDING_ICON_RADIUS,
        0,
        2 * Math.PI,
    );

    if (childrenAreVisible) {
        ctx.stroke();
    } else {
        ctx.fill();
    }

    return {
        center: {
            x: centerLeftCoordinates.x + CHILD_FOLDING_ICON_RADIUS,
            y: centerLeftCoordinates.y,
        },
        radius: CHILD_FOLDING_ICON_RADIUS,
    };
}
