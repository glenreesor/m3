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

import { Coordinates } from '../../../types';

export const BOOKMARK_ICON_WIDTH = 18;

/**
 * Draw a bookmark icon at the specified position.
 */
export function drawBookmarkIcon(args: {
    ctx: CanvasRenderingContext2D;
    centerLeftCoordinates: Coordinates;
}) {
    const { ctx, centerLeftCoordinates } = args;
    const originalCtxFillStyle = ctx.fillStyle;

    ctx.beginPath();
    ctx.moveTo(centerLeftCoordinates.x, centerLeftCoordinates.y);
    ctx.fillStyle = '#7e4fcf';

    // Middle left to top center
    ctx.lineTo(
        centerLeftCoordinates.x + BOOKMARK_ICON_WIDTH / 2,
        centerLeftCoordinates.y - BOOKMARK_ICON_WIDTH / 2,
    );

    // Top center to middle right
    ctx.lineTo(
        centerLeftCoordinates.x + BOOKMARK_ICON_WIDTH,
        centerLeftCoordinates.y,
    );

    // Middle right to bottom center
    ctx.lineTo(
        centerLeftCoordinates.x + BOOKMARK_ICON_WIDTH / 2,
        centerLeftCoordinates.y + BOOKMARK_ICON_WIDTH / 2,
    );

    // Bottom center to middle left
    ctx.lineTo(
        centerLeftCoordinates.x,
        centerLeftCoordinates.y,
    );

    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = originalCtxFillStyle;
}
