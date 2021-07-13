import * as m from 'mithril';

import state from '../state/state';

function UserActions(): m.Component {
    let editOperationsVisible = false;
    let fileOperationsVisible = false;
    let nodeInputValue = '';

    function getEditOperationsMarkup(
        rootNodeId: number,
        selectedNodeId: number,
    ):m.Vnode {
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
                        disabled: selectedNodeId === rootNodeId,
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
                        disabled: selectedNodeId === rootNodeId,
                        onclick: onDeleteNodeButtonClick,
                    },
                    'Delete Node',
                ),
                m(
                    'button',
                    { onclick: onReplaceNodeContentsButtonClick },
                    'Replace Node Contents',
                ),
            ),
            m(
                'div',
                m(
                    'button',
                    {
                        disabled: !state.document.getUndoIsAvailable(),
                        onclick: onUndoButtonClick,
                    },
                    'Undo',
                ),
                m(
                    'button',
                    {
                        disabled: !state.document.getRedoIsAvailable(),
                        onclick: onRedoButtonClick,
                    },
                    'Redo',
                ),
            ),
        );
    }

    function getFileOperationsMarkup(): m.Vnode {
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
     * Handle a change to the input box used for node contents
     */
    function onNodeInputValueChange(e: Event) {
        if (e.target !== null) {
            nodeInputValue = ((e.target) as HTMLInputElement).value;
        }
    }

    function onRedoButtonClick() {
        state.document.redo();
    }

    function onReplaceNodeContentsButtonClick() {
        state.document.replaceNodeContents(
            state.document.getSelectedNodeId(),
            nodeInputValue,
        );
    }

    function onUndoButtonClick() {
        state.document.undo();
    }

    function toggleEditOpsVisibility() {
        editOperationsVisible = !editOperationsVisible;
        if (editOperationsVisible) {
            fileOperationsVisible = false;
        }
    }

    function toggleFileOpsVisibility() {
        fileOperationsVisible = !fileOperationsVisible;
        if (fileOperationsVisible) {
            editOperationsVisible = false;
        }
    }

    return {
        view: (): m.Vnode => {
            const optionalEditUi = editOperationsVisible
                ? getEditOperationsMarkup(
                    state.document.getRootNodeId(),
                    state.document.getSelectedNodeId(),
                )
                : '';

            const optionalFileUi = (
                fileOperationsVisible ? getFileOperationsMarkup() : ''
            );

            return m(
                'div',
                m(
                    'button',
                    { onclick: toggleFileOpsVisibility },
                    'File Operations',
                ),
                m(
                    'button',
                    { onclick: toggleEditOpsVisibility },
                    'Edit Operations',
                ),
                m('br'),
                optionalEditUi,
                optionalFileUi,

                m('hr'),
            );
        },
    };
}

export default UserActions;
