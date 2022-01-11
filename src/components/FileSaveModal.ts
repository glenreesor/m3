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

import { getSavedDocumentList } from '../utils/file';

export interface FileSaveModalAttributes {
    docName: string,
    onCancel: () => void,
    onSave: (filename: string) => void,
}

/**
 * A component that presents the list of saved documents and an input box
 * used to specify the name to use when saving the current document
 *
 * @returns An object to be consumed by m()
 */
function FileSaveModal(): m.Component<FileSaveModalAttributes> {
    let inputValue = '';

    function getButtonsMarkup(attrs: FileSaveModalAttributes) {
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
                    {
                        style: 'margin-right: 10px',
                        onclick: () => onSave(attrs),
                        disabled: inputValue === '',
                    },
                    'Save',
                ),
                m(
                    'button',
                    { onclick: attrs.onCancel },
                    'Cancel',
                ),
            ],
        );
    }

    function getCurrentDocsMarkup() {
        const currentFilenamesMarkup:Array<m.Vnode> = [];
        getSavedDocumentList().forEach((filename, index) => {
            currentFilenamesMarkup.push(
                m(
                    'div',
                    {
                        // TODO: Fix using nth child stuff
                        style: {
                            background: '#ffffff',
                            paddingTop: index === 0 ? '10px' : '0',
                            paddingBottom: '10px',
                            paddingLeft: '20px',
                            paddingRight: '20px',
                        },
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
                },
            },
            currentFilenamesMarkup,
        );
    }

    function getNameInputMarkup(attrs: FileSaveModalAttributes) {
        return m(
            'div',
            {
                style: 'display: flex',
            },
            [
                m(
                    'div',
                    'Name',
                ),
                m(
                    'div',
                    m(
                        'input',
                        {
                            oninput: onInputValueChange,
                            onkeyup: (e: KeyboardEvent) => onInputKeyUp(e, attrs),
                            style: {
                                fontSize: `${state.ui.getCurrentFontSize()}px`,
                                marginLeft: '12px',
                            },
                            value: inputValue,

                        },
                    ),
                ),
            ],
        );
    }

    function getFileSaveModalMarkup(attrs: FileSaveModalAttributes): m.Vnode {
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
                getCurrentDocsMarkup(),
                getNameInputMarkup(attrs),
                getButtonsMarkup(attrs),
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

    function onInputKeyUp(e: KeyboardEvent, attrs: FileSaveModalAttributes) {
        if (e.key === 'Enter') {
            onSave(attrs);
        } else if (e.key === 'Escape') {
            attrs.onCancel();
        }
    }

    function onInputValueChange(e: Event) {
        if (e.target !== null) {
            inputValue = ((e.target) as HTMLInputElement).value;
        }
    }

    function onSave(attrs: FileSaveModalAttributes) {
        if (inputValue !== '') {
            attrs.onSave(inputValue);
        }
    }

    return {
        oninit: (node) => {
            if (node.attrs.docName !== '') {
                inputValue = node.attrs.docName;
            }
        },

        oncreate: (node) => {
            node.dom.getElementsByTagName('input')[0].focus();
        },

        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getFileSaveModalMarkup(attrs),
            ],
        ),
    };
}

export default FileSaveModal;
