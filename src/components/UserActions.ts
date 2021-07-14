import * as m from 'mithril';

import state from '../state/state';

import addChildButton from '../images/add-child.svg';
import addSiblingButton from '../images/add-sibling.svg';
import addSiblingButtonDisabled from '../images/add-sibling-disabled.svg';
import deleteNodeButton from '../images/delete-node.svg';
import deleteNodeButtonDisabled from '../images/delete-node-disabled.svg';
import editNodeButton from '../images/edit-node.svg';
import editMenuButton from '../images/edit-menu.svg';
import fileMenuButton from '../images/file-menu.svg';
import redoButton from '../images/redo.svg';
import redoButtonDisabled from '../images/redo-disabled.svg';
import undoButton from '../images/undo.svg';
import undoButtonDisabled from '../images/undo-disabled.svg';

const MENU_ICONS_HEIGHT = 40;
const MENU_ICONS_WIDTH = 40;
const MENU_ICONS_MARGIN = 2;

export const MENU_HEIGHT = MENU_ICONS_HEIGHT + MENU_ICONS_MARGIN;

function UserActions(): m.Component {
    type SelectedMenu = 'edit' | 'file';
    let selectedMenu: SelectedMenu = 'edit';

    function getEditOperationsMarkup(
        rootNodeId: number,
        selectedNodeId: number,
    ):m.Vnode {
        return m(
            'div',

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
                'undoButton',
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
                'Redo',
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

    function getMenuSelectorMarkup(): m.Vnode {
        const menuSelectedStyle = 'border: 2px solid blue; margin: 2px; padding-top: 2px;';
        const menuDeselectedStyle = 'border: 2px solid grey; margin: 2px; padding-top: 2px;';
        const editMenuButtonBorder = selectedMenu === 'edit'
            ? menuSelectedStyle
            : menuDeselectedStyle;

        const fileMenuButtonBorder = selectedMenu === 'file'
            ? menuSelectedStyle
            : menuDeselectedStyle;

        return m('div',
            m('img',
                {
                    src: fileMenuButton,
                    width: MENU_ICONS_WIDTH,
                    height: MENU_ICONS_WIDTH,
                    style: fileMenuButtonBorder,
                    onclick: () => setSelectedMenu('file'),
                }),
            m('img',
                {
                    src: editMenuButton,
                    width: MENU_ICONS_WIDTH,
                    height: MENU_ICONS_WIDTH,
                    style: editMenuButtonBorder,
                    onclick: () => setSelectedMenu('edit'),
                }));
    }

    function onAddChildButtonClick() {
        state.document.addChild(
            state.document.getSelectedNodeId(),
            'asdf', // nodeInputValue,
        );
    }

    function onAddSiblingButtonClick() {
        state.document.addSibling(
            state.document.getSelectedNodeId(),
            'asdf', // nodeInputValue,
        );
    }

    function onDeleteNodeButtonClick() {
        state.document.deleteNode(state.document.getSelectedNodeId());
    }

    /**
     * Handle a change to the input box used for node contents
     */
    /*
    function onNodeInputValueChange(e: Event) {
        if (e.target !== null) {
            nodeInputValue = ((e.target) as HTMLInputElement).value;
        }
    }
    */

    function onRedoButtonClick() {
        state.document.redo();
    }

    function onReplaceNodeContentsButtonClick() {
        state.document.replaceNodeContents(
            state.document.getSelectedNodeId(),
            'asdf', // nodeInputValue,
        );
    }

    function onundoButtonButtonClick() {
        state.document.undo();
    }

    function setSelectedMenu(menu: SelectedMenu) {
        selectedMenu = menu;
    }

    return {
        view: (): m.Vnode => {
            const menuSelectorMarkup = getMenuSelectorMarkup();
            const optionalEditUi = selectedMenu === 'edit'
                ? getEditOperationsMarkup(
                    state.document.getRootNodeId(),
                    state.document.getSelectedNodeId(),
                )
                : '';

            const optionalFileUi = selectedMenu === 'file'
                ? getFileOperationsMarkup()
                : '';

            return m(
                'div', { style: 'display: flex;' },
                menuSelectorMarkup,
                optionalEditUi,
                optionalFileUi,
            );
        },
    };
}

export default UserActions;
