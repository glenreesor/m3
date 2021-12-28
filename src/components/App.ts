import * as m from 'mithril';

import DisplayedDocument from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import BinaryModal, { BinaryModalAttributes } from './BinaryModal';
import FileExportModal, { FileExportModalAttributes } from './FileExportModal';
import FileImportModal, { FileImportModalAttributes } from './FileImportModal';
import FileOpenModal, { FileOpenModalAttributes } from './FileOpenModal';
import FileSaveModal, { FileSaveModalAttributes } from './FileSaveModal';
import MiscFileOpsModal, { MiscFileOpsModalAttributes } from './MiscFileOpsModal';
import Menu, { MENU_HEIGHT } from './Menu';
import { FILE_EXISTS, getSavedDocument, saveDocument } from '../utils/file';
import Sidebar from './Sidebar';
import TextInputModal, { TextInputModalAttributes } from './TextInputModal';

import state from '../state/state';

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
            height: window.innerHeight - MENU_HEIGHT - 12 - 35,
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
                        state.doc.replaceCurrentDocFromJson(
                            '',
                            fileContents,
                        );
                        state.ui.setCurrentModal('none');

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

            return m(
                'div',
                [
                    getOptionalModalMarkup(),
                    getOptionalSidebar(),
                    m(DocumentHeader, { documentName, hasUnsavedChanges }),
                    m(DisplayedDocument, { documentDimensions: getDocumentDimensions() }),
                    m(Menu),
                ],
            );
        },
    };
}

export default App;
