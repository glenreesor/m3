"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License, version 3, as published by
// the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Mobile Mind Mapper.  If not, see <http://www.gnu.org/licenses/>.

import {App} from "./App";

/** The App */
export let m3App;

/**
 * Mainline
 * @return {void}
 */
export function main() {
   m3App = new App();   // Prefix with m3 to ensure no namespace clashes
                        // (debug environment not wrapped in IIFE)
   m3App.run();
} // main()

// The one statement not encapsulated in a function, that triggers everything else
window.onload = main;
