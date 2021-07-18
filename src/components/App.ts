import * as m from 'mithril';

import DisplayedDocument from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import Menu, { MENU_HEIGHT } from './Menu';
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

    function getOptionalModalMarkup(): m.Vnode<TextInputModalAttributes> {
        if (state.ui.getCurrentModal() === 'addChild') {
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

        if (state.ui.getCurrentModal() === 'addSibling') {
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

        if (state.ui.getCurrentModal() === 'editNode') {
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
            const isModified = state.doc.getIsModified();

            return m(
                'div',
                [
                    getOptionalModalMarkup(),
                    getOptionalSidebar(),
                    m(DocumentHeader, { documentName, isModified }),
                    m(DisplayedDocument, { documentDimensions: getDocumentDimensions() }),
                    m(Menu),
                ],
            );
        },
    };
}

export default App;
