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

import * as m from 'mithril';

import state from '../state/state';

interface DocumentHeaderAttributes {
    documentName: string,
    hasUnsavedChanges: boolean,
}

/**
 * A component that contains the header to be shown above the document
 * (name, modified status)
 *
 * @returns A component to be consumed by m()
 */
function DocumentHeader(): m.Component<DocumentHeaderAttributes> {
    return {
        view: ({ attrs }): m.Vnode => {
            const docName = attrs.documentName === '' ? 'New Map' : attrs.documentName;
            const modifiedIndicator = attrs.hasUnsavedChanges ? ' (Modified)' : '';

            return m(
                'div',
                { style: `font-size: ${state.ui.getCurrentFontSize()}px` },
                docName,
                m(
                    'span',
                    { style: 'color: blue' },
                    modifiedIndicator,
                ),
            );
        },
    };
}

export default DocumentHeader;
