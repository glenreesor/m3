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

import { Coordinates, Dimensions } from './types';

interface DrawNodeRectangleArgs {
    ctx: CanvasRenderingContext2D;
    nodeIsSelected: boolean;
    topLeftCoordinates: Coordinates;
    dimensions: Dimensions;
}

/**
 */
export function drawRoundedRectangle({
    ctx,
    nodeIsSelected,
    topLeftCoordinates,
    dimensions,
}: DrawNodeRectangleArgs) {
    const originalStrokeStyle = ctx.strokeStyle;
    const originalLineWidth = ctx.lineWidth;

    const cornerRadius = 5;

    // Coordinates of corners as if this were a normal rectangle
    const topLeft = topLeftCoordinates;

    const topRight = {
        x: topLeft.x + dimensions.width,
        y: topLeft.y,
    };

    const bottomLeft = {
        x: topLeft.x,
        y: topLeft.y + dimensions.height,
    };

    const bottomRight = {
        x: topRight.x,
        y: bottomLeft.y,
    };

    // Draw in a clockwise direction starting at top left
    ctx.beginPath();
    if (nodeIsSelected) {
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
    } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
    }

    // Top left corner
    ctx.arc(
        topLeft.x + cornerRadius,
        topLeft.y + cornerRadius,
        cornerRadius,
        Math.PI,
        1.5 * Math.PI,
    );

    // Top line
    ctx.lineTo(topRight.x - cornerRadius, topRight.y);

    // Top right corner
    ctx.arc(
        topRight.x - cornerRadius,
        topRight.y + cornerRadius,
        cornerRadius,
        1.5 * Math.PI,
        2 * Math.PI,
    );

    // Right line
    ctx.lineTo(bottomRight.x, bottomRight.y - cornerRadius);

    // Bottom right corner
    ctx.arc(
        bottomRight.x - cornerRadius,
        bottomRight.y - cornerRadius,
        cornerRadius,
        0,
        0.5 * Math.PI,
    );

    // Bottom line
    ctx.lineTo(bottomLeft.x + cornerRadius, bottomLeft.y);

    // Bottom left corner
    ctx.arc(
        bottomLeft.x + cornerRadius,
        bottomLeft.y - cornerRadius,
        cornerRadius,
        0.5 * Math.PI,
        Math.PI,
    );

    // Left line
    ctx.lineTo(topLeft.x, topLeft.y + cornerRadius);

    // And done!
    ctx.stroke();

    ctx.strokeStyle = originalStrokeStyle;
    ctx.lineWidth = originalLineWidth;
}
