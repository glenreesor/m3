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

import { drawRoundedRectangle } from './roundedRectangle';

import { Coordinates, Dimensions } from '../../../types';
import { RectangularRegion } from '../types';

const PADDING_X = 5;
const PADDING_Y = 5;
const PADDING_BETWEEN_LINES = 4;

/**
 * An object that knows how to render a Node when given its coordinates
 */
export default class Node {
    #ctx: CanvasRenderingContext2D;

    #dimensions: Dimensions;

    #fontSize: number;

    #textLinesToRender: string[];

    #nodeIsSelected: boolean;

    constructor(args: {
        ctx: CanvasRenderingContext2D,
        fontSize: number,
        maxWidth: number,
        nodeIsSelected: boolean;
        contents: string,
    }) {
        const { contents, maxWidth } = args;

        this.#ctx = args.ctx;
        this.#fontSize = args.fontSize;
        this.#nodeIsSelected = args.nodeIsSelected;

        this.#textLinesToRender = this.#getTextLinesToRender(maxWidth, contents);
        this.#dimensions = this.#calcDimensions();
    }

    getDimensions(): Dimensions {
        return this.#dimensions;
    }

    render(centerLeftCoordinates: Coordinates): RectangularRegion {
        drawRoundedRectangle({
            ctx: this.#ctx,
            nodeIsSelected: this.#nodeIsSelected,
            topLeftCoordinates: {
                x: centerLeftCoordinates.x,
                y: centerLeftCoordinates.y - this.#dimensions.height / 2,
            },
            dimensions: this.#dimensions,
        });

        const nodeTop = centerLeftCoordinates.y - this.#dimensions.height / 2;

        // We want the text centered vertically, with PADDING_Y between the text
        // and the edge of the rectangle. 0.75 is a fudge factor to center it
        // since I know next to nothing about fonts :-)
        let textY = nodeTop + 0.75 * PADDING_Y + this.#fontSize;

        const textX = centerLeftCoordinates.x + PADDING_X;

        this.#textLinesToRender.forEach((line) => {
            this.#ctx.fillText(
                line,
                textX,
                textY,
            );
            textY += this.#fontSize + PADDING_BETWEEN_LINES;
        });

        return {
            topLeft: {
                x: centerLeftCoordinates.x,
                y: centerLeftCoordinates.y - this.#dimensions.height / 2,
            },
            dimensions: this.#dimensions,
        };
    }

    #calcDimensions(): Dimensions {
        const longestLineLength = this.#textLinesToRender.reduce(
            (currentLongestLength, line) => {
                const textMetrics = this.#ctx.measureText(line);
                return textMetrics.width > currentLongestLength
                    ? textMetrics.width
                    : currentLongestLength;
            },
            0,
        );

        const dimensions = {
            height: this.#fontSize * this.#textLinesToRender.length +
                    PADDING_BETWEEN_LINES * (this.#textLinesToRender.length - 1) +
                    2 * PADDING_Y,
            width: longestLineLength + 2 * PADDING_X,
        };

        return dimensions;
    }

    #getTextLinesToRender(maxWidth: number, contents: string): string[] {
        const textLinesToRender = [];

        let remainingContents = contents.slice();

        // Start with the entire contents and split into shorter lines (if required)
        // until the entire contents of the node have been accounted for
        while (remainingContents !== '') {
            let lastCharIndex = remainingContents.length - 1;
            let requiredWidth = this.#ctx.measureText(
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
                requiredWidth = this.#ctx.measureText(
                    remainingContents.substring(0, lastCharIndex + 1),
                ).width;
            }

            textLinesToRender.push(remainingContents.substring(0, lastCharIndex + 1));
            remainingContents = remainingContents.slice(lastCharIndex + 1);
        }

        return textLinesToRender;
    }
}
