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

// This file contains functions for dealing with individual nodes in a mind map

//      ┌───────────────────────┐  ┐
//      |                       |  ├─── PADDING_Y
//      |                       |  ┘
//      |     Node Contents     | _
//      |                       | _|─── PADDING_BETWEEN_LINES
//  ────┤     Possibly          |
//   ^  |                       |
//   |  |     multiple lines    |
//   |  |                       |
//   |  |                       |
//   |  └───────────────────────┘
//   |  └──┬─┘
//   |     └────── PADDING_X
//   |
//   |
//   └─── Connector to parent (not rendered or considered by code in this file)

import { Coordinates, Dimensions } from './types';

const PADDING_X = 5;
const PADDING_Y = 5;
const PADDING_BETWEEN_LINES = 4;

interface GetNodeRenderInfoArgs {
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    maxWidth: number,
    nodeIsSelected: boolean;
    contents: string,
}

interface GetNodeRenderInfoReturn {
    dimensions: Dimensions;
    renderNode: (parentConnectorCoords: Coordinates) => void;
}

/**
 * Get the dimensions required for rendering a node with the specified contents,
 * including the box around those contents.
 *
 * @param args                 Args to be destructured
 * @param args.ctx             The canvas drawing context to use for determining text widths
 * @param args.fontSize        Size of font that will be rendered
 * @param args.maxWidth        The maximum width (pixels) for any node
 * @param args.nodeIsSelected Whether this node is selected
 * @param args.contents        The contents of the node to be rendered
 *
 * @returns The required dimensions
 */
export function getNodeRenderInfo({
    ctx,
    fontSize,
    maxWidth,
    nodeIsSelected,
    contents,
}: GetNodeRenderInfoArgs): GetNodeRenderInfoReturn {
    const textLines = getNodeTextLines({ ctx, maxWidth, contents });
    const dimensions = getNodeDimensions({ ctx, fontSize, textLines });

    function renderNode(parentConnectorCoordinates: Coordinates) {
        privateRenderNode({
            ctx,
            fontSize,
            parentConnectorCoordinates,
            dimensions,
            nodeIsSelected,
            textLines,
        });
    }

    return {
        dimensions,
        renderNode,
    };
}

//------------------------------------------------------------------------------
// Private Implementation
//------------------------------------------------------------------------------

interface DrawNodeRectangleArgs {
    ctx: CanvasRenderingContext2D;
    nodeIsSelected: boolean;
    parentConnectorCoordinates: Coordinates;
    dimensions: Dimensions;
}

function drawRoundedRectangle({
    ctx,
    nodeIsSelected,
    parentConnectorCoordinates,
    dimensions,
}: DrawNodeRectangleArgs) {
    const cornerRadius = 5;

    // Coordinates of corners as if this were a normal rectangle
    const topLeft = {
        x: parentConnectorCoordinates.x,
        y: parentConnectorCoordinates.y - dimensions.height / 2,
    };

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

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
}

//------------------------------------------------------------------------------
interface GetDimensionsArgs {
    ctx: CanvasRenderingContext2D,
    fontSize: number,
    textLines: string[],
}

function getNodeDimensions({ ctx, fontSize, textLines }: GetDimensionsArgs): Dimensions {
    const longestLineLength = textLines.reduce(
        (currentLongestLength, line) => {
            const textMetrics = ctx.measureText(line);
            return textMetrics.width > currentLongestLength
                ? textMetrics.width
                : currentLongestLength;
        },
        0,
    );

    const dimensions = {
        height: fontSize * textLines.length +
                PADDING_BETWEEN_LINES * (textLines.length - 1) +
                2 * PADDING_Y,
        width: longestLineLength + 2 * PADDING_X,
    };

    return dimensions;
}

//------------------------------------------------------------------------------
interface GetNodeTextLinesArgs {
    ctx: CanvasRenderingContext2D;
    maxWidth: number;
    contents: string;
}

function getNodeTextLines({
    ctx,
    maxWidth,
    contents,
}: GetNodeTextLinesArgs): string[] {
    const lines = [];
    let remainingContents = contents.slice();

    // Start with the entire contents and split into shorter lines (if required)
    // until the entire contents of the node have been accounted for
    while (remainingContents !== '') {
        let lastCharIndex = remainingContents.length - 1;
        let requiredWidth = ctx.measureText(
            remainingContents.substring(0, lastCharIndex + 1),
        ).width;

        // Keep shortening text until it fits within the max width
        while (requiredWidth > maxWidth && lastCharIndex > 0) {
            lastCharIndex -= 1;

            // Text is too long, so shorten by looking backwards for the first
            // space (so we don't split words)
            while (
                remainingContents.charAt(lastCharIndex) !== ' ' &&
                lastCharIndex > 0
            ) {
                lastCharIndex -= 1;
            }
            requiredWidth = ctx.measureText(
                remainingContents.substring(0, lastCharIndex + 1),
            ).width;
        }

        lines.push(remainingContents.substring(0, lastCharIndex + 1));
        remainingContents = remainingContents.slice(lastCharIndex + 1);
    }

    return lines;
}

//------------------------------------------------------------------------------
interface PrivateRenderNodeArgs {
    ctx: CanvasRenderingContext2D;
    fontSize: number;
    parentConnectorCoordinates: Coordinates;
    dimensions: Dimensions;
    nodeIsSelected: boolean;
    textLines: string[];
}

function privateRenderNode({
    ctx,
    fontSize,
    parentConnectorCoordinates,
    dimensions,
    nodeIsSelected,
    textLines,
}: PrivateRenderNodeArgs) {
    drawRoundedRectangle({
        ctx,
        nodeIsSelected,
        parentConnectorCoordinates,
        dimensions,
    });

    const nodeTop = parentConnectorCoordinates.y - dimensions.height / 2;

    // We want the text centered vertically, with PADDING_Y between the text
    // and the edge of the rectangle. 0.75 is a fudge factor to center it
    // since I know next to nothing about fonts :-)
    let textY = nodeTop + 0.75 * PADDING_Y + fontSize;

    const textX = parentConnectorCoordinates.x + PADDING_X;

    textLines.forEach((line) => {
        ctx.fillText(
            line,
            textX,
            textY,
        );
        textY += fontSize + PADDING_BETWEEN_LINES;
    });
}
