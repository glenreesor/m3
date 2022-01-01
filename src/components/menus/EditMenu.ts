import * as m from 'mithril';

import state from '../../state/state';

import addChildButton from './images/add-child.svg';
import addSiblingButton from './images/add-sibling.svg';
import addSiblingButtonDisabled from './images/add-sibling-disabled.svg';
import deleteNodeButton from './images/delete-node.svg';
import deleteNodeButtonDisabled from './images/delete-node-disabled.svg';
import editNodeButton from './images/edit-node.svg';
import hamburgerMenuButton from './images/hamburger-button.svg';
import redoButton from './images/redo.svg';
import redoButtonDisabled from './images/redo-disabled.svg';
import undoButton from './images/undo.svg';
import undoButtonDisabled from './images/undo-disabled.svg';

import fileSaveButton from './images/file-save.svg';
import { onSaveButtonClick } from './FileMenu';

import { MENU_ICONS_HEIGHT, MENU_ICONS_WIDTH } from './constants';

/**
 * A component that renders the Edit menu
 *
 * @returns An object to be consumed by m()
 */
function EditMenu(): m.Component {
    return {
        view: (): m.Vnode => {
            const rootNodeId = state.doc.getRootNodeId();
            const selectedNodeId = state.doc.getSelectedNodeId();

            return m(
                'div',
                { style: 'text-align: right' },

                // Save Button -- not really an "Edit" thing, but put it here
                // for user convenience
                m(
                    'img',
                    {
                        onclick: onSaveButtonClick,
                        src: fileSaveButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                    },
                ),

                // Undo
                m(
                    'img',
                    {
                        src: state.doc.getUndoIsAvailable()
                            ? undoButton
                            : undoButtonDisabled,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onUndoButtonButtonClick,
                    },
                ),

                // Redo
                m(
                    'img',
                    {
                        src: state.doc.getRedoIsAvailable()
                            ? redoButton
                            : redoButtonDisabled,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onRedoButtonClick,
                    },
                ),

                // Delete Node
                m(
                    'img',
                    {
                        src: selectedNodeId === rootNodeId
                            ? deleteNodeButtonDisabled
                            : deleteNodeButton,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onDeleteNodeButtonClick,
                    },
                ),

                // Edit Node
                m(
                    'img',
                    {
                        src: editNodeButton,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onReplaceNodeContentsButtonClick,
                    },
                ),

                // Add Child
                m(
                    'img',
                    {
                        src: addChildButton,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onAddChildButtonClick,
                    },
                ),

                // Add Sibling
                m(
                    'img',
                    {
                        src: selectedNodeId === rootNodeId
                            ? addSiblingButtonDisabled
                            : addSiblingButton,
                        height: MENU_ICONS_HEIGHT,
                        width: MENU_ICONS_WIDTH,
                        style: 'margin: 2px;',
                        onclick: onAddSiblingButtonClick,
                    },
                ),

                // Sidebar Button
                m(
                    'img',
                    {
                        src: hamburgerMenuButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                        onclick: () => state.ui.setSidebarVisibility(true),
                    },
                ),
            );
        },
    };
}

function onAddChildButtonClick() {
    state.ui.setCurrentModal('addChild');
}

function onAddSiblingButtonClick() {
    const rootNodeId = state.doc.getRootNodeId();
    const selectedNodeId = state.doc.getSelectedNodeId();

    if (selectedNodeId !== rootNodeId) {
        state.ui.setCurrentModal('addSibling');
    }
}

function onDeleteNodeButtonClick() {
    const rootNodeId = state.doc.getRootNodeId();
    const selectedNodeId = state.doc.getSelectedNodeId();

    if (selectedNodeId !== rootNodeId) {
        state.doc.deleteNode(state.doc.getSelectedNodeId());
    }
}

function onRedoButtonClick() {
    if (state.doc.getRedoIsAvailable()) {
        state.doc.redo();
    }
}

function onReplaceNodeContentsButtonClick() {
    state.ui.setCurrentModal('editNode');
}

function onUndoButtonButtonClick() {
    if (state.doc.getUndoIsAvailable()) {
        state.doc.undo();
    }
}

export default EditMenu;
