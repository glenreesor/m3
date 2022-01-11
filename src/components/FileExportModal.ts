// Copyright 2022 Glen Reesor
//
// This file is part of m3 Mobile Mind Mapper.
//
// m3 Mobile Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// m3 Mobile Mind Mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// m3 Mobile Mind Mapper. If not, see <https://www.gnu.org/licenses/>.

import * as m from 'mithril';

import state from '../state/state';

export interface FileExportModalAttributes {
    onClose: () => void,
}

/**
 * A component that provides a Blob link to the current document in JSON format
 *
 * @returns An object to be consumed by m()
 */
function FileExportModal(): m.Component<FileExportModalAttributes> {
    function getButtonMarkup(attrs: FileExportModalAttributes) {
        return m(
            'div',
            {
                style: {
                    marginTop: '20px',
                    textAlign: 'right',
                },
            },
            [
                m(
                    'button',
                    { onclick: attrs.onClose },
                    'Close',
                ),
            ],
        );
    }

    function getFileExportModalMarkup(attrs: FileExportModalAttributes): m.Vnode {
        const dateNow = new Date(Date.now());

        /* eslint-disable prefer-template */
        const formattedDate = dateNow.getFullYear() + '-' +

            // Don't forget JS months are zero-based. omg
            getNumberAsZeroPaddedTwoDigits(dateNow.getMonth() + 1) + '-' +

            getNumberAsZeroPaddedTwoDigits(dateNow.getDate()) +
            '---' +
            getNumberAsZeroPaddedTwoDigits(dateNow.getHours()) + ':' +
            getNumberAsZeroPaddedTwoDigits(dateNow.getMinutes()) + ':' +
            getNumberAsZeroPaddedTwoDigits(dateNow.getSeconds());

        const documentAsJson = state.doc.getCurrentDocAsJson();
        const blobUrl = URL.createObjectURL(
            new Blob([documentAsJson], { type: 'text/json' }),
        );
        const blobFilename = `m3-${state.doc.getDocName()}--${formattedDate}.m3`;

        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    background: '#dddddd',
                    padding: '10px',
                    border: '2px solid blue',
                    fontSize: `${state.ui.getCurrentFontSize()}px`,
                    position: 'fixed',
                    left: '50%',
                    top: '35%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '20',
                },
            },
            [
                m(
                    'div',
                    'Download: ',
                    m(
                        'a',
                        {
                            href: blobUrl,
                            download: blobFilename,
                        },
                        blobFilename,
                    ),
                ),
                getButtonMarkup(attrs),
            ],
        );
    }

    function getNumberAsZeroPaddedTwoDigits(num: number): string {
        return num < 10 ? `0${num.toString()}` : num.toString();
    }

    function getOverlayMarkup(): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    position: 'fixed',
                    top: '0px',
                    width: '100%',
                    height: '100vh',
                    background: 'rgba(255, 255, 255, 0.5)',
                    zIndex: '10',
                },
            },
        );
    }

    return {
        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getFileExportModalMarkup(attrs),
            ],
        ),
    };
}

export default FileExportModal;
