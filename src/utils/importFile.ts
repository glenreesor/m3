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

import state from '../state/state';
import importFreeplane from './importFreeplane';
import { getUniqueFilename } from './file';

/**
 * Import the specified content as the current document (replacing whatever the
 * currently loaded m3 document is)
 *
 * @param fileContents The document to be imported -- can be either Freeplane
 *                     or m3.
 */
export default function importFile(fileContents: string) {
    if (fileContents.startsWith('<map version')) {
        importFreeplane(fileContents);
    } else if (fileContents.startsWith('{')) {
        state.doc.replaceCurrentDocFromJson(
            getUniqueFilename('Imported m3 Document'),
            fileContents,
        );
    } else {
        console.log('Unable to determine file type');
    }
}
