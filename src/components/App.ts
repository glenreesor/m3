import * as m from 'mithril';

import Document from './DisplayedDocument';
import state from '../state/state';

/**
 * The m3 app entry point
 *
 * @returns An object to be consumed by m()
 */
function App(): m.Component {
    let nodeInputValue = '';

    /**
     * Get the dimensions to be used for the document
     *
     * @returns The dimensions
     */
    function getDocumentDimensions(): {width: number, height: number} {
        return {
            width: window.innerWidth - 20,
            height: window.innerHeight - 200, // Hack for stuff at top for now
        };
    }

    /**
     * Get the markup for Edit operations (add, delete, etc)
     *
     * @returns The markup
     */
    function getEditUi():m.Vnode {
        return m(
            'div',
            m(
                'div',
                m(
                    'input',
                    { onchange: onNodeInputValueChange },
                ),
                m(
                    'button',
                    {
                        disabled:
                            state.document.getSelectedNodeId()
                            === state.document.getRootNodeId(),
                        onclick: onAddSiblingButtonClick,
                    },
                    'Add Sibling',
                ),
                m(
                    'button',
                    { onclick: onAddChildButtonClick },
                    'Add Child',
                ),
                m(
                    'button',
                    {
                        disabled:
                            state.document.getSelectedNodeId()
                            === state.document.getRootNodeId(),
                        onclick: onDeleteNodeButtonClick,
                    },
                    'Delete Node',
                ),
            ),
            m(
                'div',
                m(
                    'button',
                    {
                        disabled: !state.document.getUndoIsAvailable(),
                        onclick: onUndoClick,
                    },
                    'Undo',
                ),
                m(
                    'button',
                    {
                        disabled: !state.document.getRedoIsAvailable(),
                        onclick: onRedoClick,
                    },
                    'Redo',
                ),
            ),
            m(
                'div',
                m('button', 'Cut'),
                m('button', 'Copy'),
                m('button', 'Paste'),
            ),
        );
    }

    /**
     * Get the markup for File operations (open, save, etc)
     *
     * @returns The markup
     */
    function getFileUi() {
        return m(
            'div',
            m('button', 'New'),
            m('button', 'Open'),
            m('button', 'Save'),
        );
    }

    function onAddChildButtonClick() {
        state.document.addChild(
            state.document.getSelectedNodeId(),
            nodeInputValue,
        );
    }

    function onAddSiblingButtonClick() {
        state.document.addSibling(
            state.document.getSelectedNodeId(),
            nodeInputValue,
        );
    }

    function onDeleteNodeButtonClick() {
        state.document.deleteNode(state.document.getSelectedNodeId());
    }

    /**
     * Handling clicking of the Undo button
     */
    function onUndoClick() {
        state.document.undo();
    }

    /**
     * Handling clicking of the Redo button
     */
    function onRedoClick() {
        state.document.redo();
    }

    /**
     * Handle a change to the input box used for node contents
     *
     * @param e The event that triggered this change
     */
    function onNodeInputValueChange(e: Event) {
        if (e.target !== null) {
            nodeInputValue = ((e.target) as HTMLInputElement).value;
        }
    }

    return {
        view: () => {
            const optionalEditUi = (
                state.ui.getEditOpsVisible() ? getEditUi() : ''
            );

            const optionalFileUi = (
                state.ui.getFileOpsVisible() ? getFileUi() : ''
            );

            const docName = state.document.getDocName();
            const isModified = state.document.getIsModified();

            return m(
                'div',
                m(
                    'button',
                    { onclick: state.ui.toggleFileOpsVisibility },
                    'File Operations',
                ),
                m('br'),
                optionalFileUi,

                m('hr'),
                m(
                    'button',
                    { onclick: state.ui.toggleEditOpsVisibility },
                    'Edit Operations',
                ),
                m('br'),
                optionalEditUi,

                m('hr'),
                m(
                    'div',
                    `${docName} ${isModified ? 'X' : ''}`,
                ),

                m(
                    Document,
                    {
                        documentDimensions: getDocumentDimensions(),
                    },
                ),
            );
        },
    };
}

export default App;
