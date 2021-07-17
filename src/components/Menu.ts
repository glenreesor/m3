import * as m from 'mithril';

import state from '../state/state';

import addChildButton from '../images/add-child.svg';
import addSiblingButton from '../images/add-sibling.svg';
import addSiblingButtonDisabled from '../images/add-sibling-disabled.svg';
import deleteNodeButton from '../images/delete-node.svg';
import deleteNodeButtonDisabled from '../images/delete-node-disabled.svg';
import editNodeButton from '../images/edit-node.svg';
import hamburgerMenuButton from '../images/hamburger-button.svg';
import redoButton from '../images/redo.svg';
import redoButtonDisabled from '../images/redo-disabled.svg';
import undoButton from '../images/undo.svg';
import undoButtonDisabled from '../images/undo-disabled.svg';

const MENU_ICONS_HEIGHT = 40;
const MENU_ICONS_WIDTH = 40;
const MENU_ICONS_MARGIN = 2;

export const MENU_HEIGHT = MENU_ICONS_HEIGHT + MENU_ICONS_MARGIN;

function Menu(): m.Component {
    function getEditOperationsMarkup(
        rootNodeId: number,
        selectedNodeId: number,
    ):m.Vnode {
        return m(
            'div',
            { style: 'text-align: right' },

            // Undo
            m(
                'img',
                {
                    src: state.document.getUndoIsAvailable()
                        ? undoButton
                        : undoButtonDisabled,
                    height: MENU_ICONS_HEIGHT,
                    width: MENU_ICONS_WIDTH,
                    style: 'margin: 2px;',
                    onclick: onundoButtonButtonClick,
                },
            ),

            // Redo
            m(
                'img',
                {
                    // disabled: !state.document.getRedoIsAvailable(),
                    src: state.document.getRedoIsAvailable()
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
    }

    function getFileOperationsMarkup(): m.Vnode {
        return m(
            'div',
            { style: 'text-align: right' },
            [
                m('button', 'New'),
                m('button', 'Open'),
                m('button', 'Save'),

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
            ],
        );
    }

    function onAddChildButtonClick() {
        state.ui.setCurrentModal('addChild');
    }

    function onAddSiblingButtonClick() {
        state.ui.setCurrentModal('addSibling');
    }

    function onDeleteNodeButtonClick() {
        state.document.deleteNode(state.document.getSelectedNodeId());
    }

    function onRedoButtonClick() {
        state.document.redo();
    }

    function onReplaceNodeContentsButtonClick() {
        state.ui.setCurrentModal('editNode');
    }

    function onundoButtonButtonClick() {
        state.document.undo();
    }

    return {
        view: (): m.Vnode => {
            const optionalEditUi = state.ui.getCurrentMenu() === 'edit'
                ? getEditOperationsMarkup(
                    state.document.getRootNodeId(),
                    state.document.getSelectedNodeId(),
                )
                : '';

            const optionalFileUi = state.ui.getCurrentMenu() === 'file'
                ? getFileOperationsMarkup()
                : '';

            return m(
                'div',
                [
                    optionalEditUi,
                    optionalFileUi,
                ],
            );
        },
    };
}

export default Menu;
