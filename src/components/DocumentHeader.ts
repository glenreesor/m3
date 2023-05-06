// Copyright 2022, 2023 Glen Reesor
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
    docLastExportedTimestamp: number | undefined,
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

            let formattedExportedTimestamp = '';
            if (attrs.docLastExportedTimestamp) {
                const exportedDateObject = new Date(attrs.docLastExportedTimestamp);
                const exportedYear = exportedDateObject.getFullYear();

                // JS Date months are 0-based
                const exportedMonth = exportedDateObject.getMonth() + 1;
                const exportedDate = exportedDateObject.getDate();

                const monthPadding = exportedMonth < 10 ? '0' : '';
                const datePadding = exportedDate < 10 ? '0' : '';
                formattedExportedTimestamp = `${exportedYear}-${monthPadding}${exportedMonth}-${datePadding}${exportedDate}`;
            }

            const lastExportedInfo = attrs.docLastExportedTimestamp
                ? `Last Exported: ${formattedExportedTimestamp}`
                : '';

            return m(
                'div',
                {
                    style: `display: flex; justify-content: space-between; font-size: ${state.ui.getCurrentFontSize()}px`,
                },
                m(
                    'span',
                    docName,
                    m(
                        'span',
                        { style: 'color: blue' },
                        modifiedIndicator,
                    ),
                ),
                lastExportedInfo,
            );
        },
    };
}

export default DocumentHeader;
