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

import DisplayedDocument from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import BinaryModal from './BinaryModal';
import FileExportModal, { FileExportModalAttributes } from './FileExportModal';
import FileImportModal, { FileImportModalAttributes } from './FileImportModal';
import FileOpenModal, { FileOpenModalAttributes } from './FileOpenModal';
import FileSaveModal, { FileSaveModalAttributes } from './FileSaveModal';
import MiscFileOpsModal, { MiscFileOpsModalAttributes } from './MiscFileOpsModal';
import Menu from './Menu';
import { MENU_HEIGHT } from './menus/constants';
import { FILE_EXISTS, getSavedDocument, saveDocument } from '../utils/file';
import importFile from '../utils/importFile';
import Sidebar from './Sidebar';
import TextInputModal, { TextInputModalAttributes } from './TextInputModal';

import state from '../state/state';
import { BinaryModalAttributes } from '../state/uiState';

/**
 * A component that contains the entire app.
 *
 * @returns An object to be consumed by m()
 */
function App(): m.Component {
    /**
     * Get the dimensions to be used for the document
     *
     * @returns The dimensions
     */
    function getDocumentDimensions(): {width: number, height: number} {
        return {
            width: window.innerWidth - 20,

            // TODO: Turn this into a not-hack
            height: window.innerHeight - MENU_HEIGHT - state.ui.getCurrentFontSize() - 35,
        };
    }

    function getOptionalSidebar(): m.Vnode {
        if (state.ui.getSidebarIsVisible()) {
            return m(Sidebar);
        }

        return m('');
    }

    function getOptionalModalMarkup():
        m.Vnode<BinaryModalAttributes> |
        m.Vnode<FileExportModalAttributes> |
        m.Vnode<FileImportModalAttributes> |
        m.Vnode<FileOpenModalAttributes> |
        m.Vnode<FileSaveModalAttributes> |
        m.Vnode<MiscFileOpsModalAttributes> |
        m.Vnode<TextInputModalAttributes> {
        const currentModal = state.ui.getCurrentModal();

        if (currentModal === 'addChild') {
            return m(
                TextInputModal,
                {
                    initialValue: '',
                    onCancel: () => { state.ui.setCurrentModal('none'); },
                    onSave: (text: string) =>  {
                        const newNodeId = state.doc.addChild(
                            state.doc.getSelectedNodeId(),
                            text,
                        );
                        state.doc.setSelectedNodeId(newNodeId);
                        state.ui.setCurrentModal('none');
                    },
                },
            );
        }

        if (currentModal === 'addSibling') {
            return m(
                TextInputModal,
                {
                    initialValue: '',
                    onCancel: () => { state.ui.setCurrentModal('none'); },
                    onSave: (text: string) => {
                        const newNodeId = state.doc.addSibling(
                            state.doc.getSelectedNodeId(),
                            text,
                        );
                        state.doc.setSelectedNodeId(newNodeId);
                        state.ui.setCurrentModal('none');
                    },
                },
            );
        }

        if (currentModal === 'binaryModal') {
            const binaryModalAttrs = state.ui.getBinaryModalAttrs();
            return binaryModalAttrs !== undefined
                ?
                m(
                    BinaryModal,
                    binaryModalAttrs,
                )
                : m('');
        }

        if (currentModal === 'editNode') {
            return m(
                TextInputModal,
                {
                    initialValue: state.doc.getNodeContents(
                        state.doc.getSelectedNodeId(),
                    ),
                    onCancel: () => { state.ui.setCurrentModal('none'); },
                    onSave: (text: string) => {
                        state.doc.replaceNodeContents(
                            state.doc.getSelectedNodeId(),
                            text,
                        );
                        state.ui.setCurrentModal('none');
                    },
                },
            );
        }

        if (currentModal === 'fileExport') {
            return m(
                FileExportModal,
                {
                    onClose: () => state.ui.setCurrentModal('none'),
                },
            );
        }

        if (currentModal === 'fileImport') {
            return m(
                FileImportModal,
                {
                    onCancel: () => state.ui.setCurrentModal('none'),
                    onFileContentsRead: (fileContents) => {
                        importFile(fileContents);
                        state.ui.setCurrentModal('none');
                        state.ui.setResetDueToNewDoc(true);

                        // This state change was triggered by an async fileReader
                        // operation, not a DOM event, thus we need to trigger
                        // a rerender ourselves
                        m.redraw();
                    },
                },
            );
        }

        if (currentModal === 'fileOpen') {
            return m(
                FileOpenModal,
                {
                    onCancel: () => state.ui.setCurrentModal('none'),
                    onFileSelected: (filename: string) => {
                        const documentAsJson = getSavedDocument(filename);
                        if (typeof documentAsJson === 'number') {
                            console.log('Unexpected file load error');
                        } else {
                            state.doc.replaceCurrentDocFromJson(
                                filename,
                                documentAsJson,
                            );
                            state.ui.setCurrentModal('none');
                            state.ui.setResetDueToNewDoc(true);
                        }
                    },
                },
            );
        }

        if (currentModal === 'fileSave') {
            return m(
                FileSaveModal,
                {
                    docName: state.doc.getDocName(),
                    onCancel: () => state.ui.setCurrentModal('none'),
                    onSave: (filename: string) => {
                        const saveStatus = saveDocument(
                            false,
                            filename,
                            state.doc.getCurrentDocAsJson(),
                        );

                        if (saveStatus === FILE_EXISTS) {
                            state.ui.setCurrentModal('binaryModal');
                            state.ui.setBinaryModalAttrs({
                                prompt: 'File exists. Overwrite?',
                                yesButtonText: 'Yes',
                                noButtonText: 'No',
                                onYesButtonClick: () => {
                                    saveDocument(true, filename, state.doc.getCurrentDocAsJson());
                                    state.doc.setDocName(filename);
                                    state.ui.setCurrentModal('none');
                                },
                                onNoButtonClick: () => state.ui.setCurrentModal('fileSave'),
                            });
                        } else {
                            state.doc.setDocName(filename);
                            state.ui.setCurrentModal('none');
                        }
                    },
                },
            );
        }

        if (currentModal === 'miscFileOps') {
            return m(
                MiscFileOpsModal,
                {
                    onClose: () => state.ui.setCurrentModal('none'),
                },
            );
        }

        return m('');
    }

    function onWindowResize() {
        m.redraw();
    }

    return {
        oncreate: () => {
            window.addEventListener('resize', onWindowResize);
        },

        onremove: () => {
            window.removeEventListener('resize', onWindowResize);
        },

        view: (): m.Vnode => {
            const documentName = state.doc.getDocName();
            const hasUnsavedChanges = state.doc.hasUnsavedChanges();
            const performReset = state.ui.getResetDueToNewDoc();
            state.ui.setResetDueToNewDoc(false);

            return m(
                'div',
                [
                    getOptionalModalMarkup(),
                    getOptionalSidebar(),
                    m(DocumentHeader, { documentName, hasUnsavedChanges }),
                    m(
                        DisplayedDocument,
                        {
                            documentDimensions: getDocumentDimensions(),
                            performReset,
                        },
                    ),
                    m(Menu),
                ],
            );
        },
    };
}

export default App;
