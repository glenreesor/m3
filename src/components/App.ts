import * as m from 'mithril';

import DisplayedDocument from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import FileOpenModal, { FileOpenModalAttributes } from './FileOpenModal';
import FileSaveModal, { FileSaveModalAttributes } from './FileSaveModal';
import Menu, { MENU_HEIGHT } from './Menu';
import { getSavedDocument, saveDocument } from '../utils/file';
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
        m.Vnode<FileOpenModalAttributes> |
        m.Vnode<FileSaveModalAttributes> |
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

        if (currentModal === 'fileSave') {
            return m(
                FileSaveModal,
                {
                    docName: state.doc.getDocName(),
                    onCancel: () => state.ui.setCurrentModal('none'),
                    onSave: (filename: string) => {
                        saveDocument(
                            false,
                            filename,
                            state.doc.getCurrentDocAsJson(),
                        );
                        state.ui.setCurrentModal('none');
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
                        }
                        state.ui.setCurrentModal('none');
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
