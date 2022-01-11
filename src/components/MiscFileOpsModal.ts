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

import { deleteDocument, getSavedDocumentList, renameDocument } from '../utils/file';
import state from '../state/state';

export interface MiscFileOpsModalAttributes {
    onClose: () => void,
}

/**
 * A component that presents the list of saved documents and allows the user
 * to rename or delete individual docs.
 *
 * @returns An object to be consumed by m()
 */
function MiscFileOpsModal(): m.Component<MiscFileOpsModalAttributes> {
    let renameValue = '';
    let forRealDelete = false;

    function onDeleteButtonClick(documentName: string, onClose: Function) {
        if (forRealDelete) {
            deleteDocument(documentName);
            onClose();
        }
    }

    function onRenameButtonClick(documentName: string, onClose: Function) {
        if (renameValue !== '') {
            renameDocument(documentName, renameValue);
            onClose();
        }
    }

    function onRenameValueChange(e: Event) {
        if (e.target !== null) {
            renameValue = ((e.target) as HTMLInputElement).value;
        }
    }

    function getCloseButtonMarkup(attrs: MiscFileOpsModalAttributes) {
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

    function getCurrentDocsMarkup(attrs: MiscFileOpsModalAttributes) {
        const currentFilenamesMarkup:Array<m.Vnode> = [];
        const currentDocName = state.doc.getDocName();

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
                    },
                    filename + (currentDocName === filename ? ' (Current)' : ''),
                    (currentDocName !== filename) && m(
                        'div',
                        {
                            style: {
                                background: '#eeeeee',
                                padding: '10px',
                            },
                        },
                        [
                            m(
                                'button',
                                {
                                    style: 'margin-left: 10px',
                                    onclick: () => onRenameButtonClick(filename, attrs.onClose),
                                },
                                'Rename to:',
                            ),
                            m(
                                'input',
                                {
                                    value: renameValue,
                                    style: {
                                        fontSize: `${state.ui.getCurrentFontSize()}px`,
                                        width: `${window.innerWidth / 2}px`,
                                    },
                                    oninput: onRenameValueChange,
                                },
                            ),
                            m(
                                'button',
                                {
                                    style: 'margin-left: 10px',
                                    onclick: () => onDeleteButtonClick(filename, attrs.onClose),
                                },
                                'Delete',
                            ),
                            'For real delete: ',
                            m(
                                'input',
                                {
                                    type: 'checkbox',
                                    checked: forRealDelete,
                                    onclick: () => { forRealDelete = !forRealDelete; },
                                },
                            ),
                        ],
                    ),
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

                    // TODO: Make this a non-hack
                },
            },
            currentFilenamesMarkup,
        );
    }

    function getModalMarkup(attrs: MiscFileOpsModalAttributes): m.Vnode {
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
                    left: '30%',
                    right: '30%',
                    top: '35%',
                    width: '60%',
                    transform: 'translate(-20%, -50%)',
                    zIndex: '20',
                },
            },
            [
                getCurrentDocsMarkup(attrs),
                getCloseButtonMarkup(attrs),
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
                getModalMarkup(attrs),
            ],
        ),
    };
}

export default MiscFileOpsModal;
