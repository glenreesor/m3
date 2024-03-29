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

import DisplayedDocument from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import BinaryModal from './BinaryModal';
import BookmarksListModal, { BookmarksListModalAttributes } from './BookmarksListModal';
import FileExportModal, { FileExportModalAttributes } from './FileExportModal';
import FileImportModal, { FileImportModalAttributes } from './FileImportModal';
import FileOpenModal, { FileOpenModalAttributes } from './FileOpenModal';
import FileSaveModal, { FileSaveModalAttributes } from './FileSaveModal';
import MiscFileOpsModal, { MiscFileOpsModalAttributes } from './MiscFileOpsModal';
import Menu from './Menu';
import { MENU_HEIGHT } from './menus/constants';
import {
    FILE_EXISTS,
    getLastUsedDocumentName,
    getSavedDocument,
    getSavedDocumentList,
    saveDocument,
} from '../utils/file';
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
        m.Vnode<TextInputModalAttributes> |
        m.Vnode<BookmarksListModalAttributes> {
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
                        state.canvas.resetRootNodeCoords();

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
                            state.canvas.resetRootNodeCoords();
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

        if (currentModal === 'bookmarksList') {
            return m(
                BookmarksListModal,
                {
                    onCancel: () => state.ui.setCurrentModal('none'),
                    onBookmarkSelected: (nodeId) => {
                        state.doc.ensureNodeVisible(nodeId);
                        state.doc.setSelectedNodeId(nodeId);
                        state.ui.setCurrentModal('none');

                        // We need to wait for a redraw before we can trigger
                        // the scroll because we need the map to be redrawn
                        // so we have the coordinates of the target node.
                        // (It may not have been visible if its parent had
                        // folded children)
                        setTimeout(() => state.canvas.scrollToNode(nodeId));
                    },
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
            state.canvas.setCanvasDimensions(getDocumentDimensions());
            state.canvas.resetRootNodeCoords();

            const lastUsedDocumentName = getLastUsedDocumentName();
            if (
                lastUsedDocumentName !== null &&
                getSavedDocumentList().includes(lastUsedDocumentName)
            ) {
                const docToLoad = getSavedDocument(lastUsedDocumentName);
                if (typeof docToLoad !== 'number') {
                    state.doc.replaceCurrentDocFromJson(
                        lastUsedDocumentName,
                        docToLoad,
                    );

                    // Need to do this to get the header to update
                    m.redraw();
                }
            }
        },

        onremove: () => {
            window.removeEventListener('resize', onWindowResize);
        },

        view: (): m.Vnode => {
            const documentName = state.doc.getDocName();
            const hasUnsavedChanges = state.doc.hasUnsavedChanges();
            const docLastExportedTimestamp = state.doc.getDocLastExportedTimestamp();

            return m(
                'div',
                [
                    getOptionalModalMarkup(),
                    getOptionalSidebar(),
                    m(
                        DocumentHeader,
                        {
                            documentName,
                            hasUnsavedChanges,
                            docLastExportedTimestamp,
                        },
                    ),
                    m(
                        DisplayedDocument,
                        {
                            documentDimensions: getDocumentDimensions(),
                        },
                    ),
                    m(Menu),
                ],
            );
        },
    };
}

export default App;
