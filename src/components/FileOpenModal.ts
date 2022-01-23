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

import { getSavedDocumentList } from '../utils/file';

export interface FileOpenModalAttributes {
    onCancel: () => void,
    onFileSelected: (filename: string) => void,
}

/**
 * A component that presents the list of saved documents and allows the user
 * to select which one to load
 *
 * @returns An object to be consumed by m()
 */
function FileOpenModal(): m.Component<FileOpenModalAttributes> {
    function getButtonMarkup(attrs: FileOpenModalAttributes) {
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
                    { onclick: attrs.onCancel },
                    'Cancel',
                ),
            ],
        );
    }

    function getCurrentDocsMarkup(attrs: FileOpenModalAttributes) {
        const currentFilenamesMarkup:Array<m.Vnode> = [];
        getSavedDocumentList().forEach((filename, index) => {
            currentFilenamesMarkup.push(
                m(
                    'div',
                    {
                        // TODO: Fix using nth child stuff
                        style: {
                            background: '#ffffff',
                            fontSize: `${state.ui.getCurrentFontSize()}px`,
                            paddingTop: index === 0 ? '10px' : '0',
                            paddingBottom: '10px',
                            paddingLeft: '20px',
                            paddingRight: '20px',
                        },
                        onclick: () => attrs.onFileSelected(filename),
                    },
                    filename,
                ),
            );
        });

        return m(
            'div',
            {
                style: {
                    height: '100px',
                    overflow: 'auto',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '55px',

                    // TODO: Make this a non-hack
                    width: '200px',
                    maxWidth: '75%',
                },
            },
            currentFilenamesMarkup,
        );
    }

    function getFileOpenModalMarkup(attrs: FileOpenModalAttributes): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    background: '#dddddd',
                    padding: '10px',
                    border: '2px solid blue',
                    fontSize: '14px',
                    position: 'fixed',
                    left: '50%',
                    top: '35%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '20',
                },
            },
            [
                getCurrentDocsMarkup(attrs),
                getButtonMarkup(attrs),
            ],
        );
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
                getFileOpenModalMarkup(attrs),
            ],
        ),
    };
}

export default FileOpenModal;
