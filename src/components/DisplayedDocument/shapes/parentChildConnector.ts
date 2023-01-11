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

import { Coordinates } from '../types';

/**
 * Render the curve that connects a parent node's children foldingIcon to a child node
 */
export function renderParentChildConnector(
    ctx: CanvasRenderingContext2D,
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
