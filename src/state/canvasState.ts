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

export default (
    (): {
        getRootNodeCoords: () => Coordinates,
        resetRootNodeCoords: () => void,
        setCanvasDimensions: (dimensions: Dimensions) => void,
        setRootNodeCoords: (newCoords: Coordinates) => void,
        translateRootNode: (dx: number, dy: number) => void,
    } => {
        let canvasDimensions: Dimensions = { width: 0, height: 0 };
        let rootNodeCoords: Coordinates = { x: 0, y: 0 };

        return {
            getRootNodeCoords: () => rootNodeCoords,

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
                rootNodeCoords = {
                    x: rootNodeCoords.x + dx,
                    y: rootNodeCoords.y + dy,
                };
            },
        };
    }
)();
