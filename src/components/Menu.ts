import * as m from 'mithril';

import state from '../state/state';
import addChildButton from '../images/add-child.svg';
import addSiblingButton from '../images/add-sibling.svg';
import addSiblingButtonDisabled from '../images/add-sibling-disabled.svg';
import deleteNodeButton from '../images/delete-node.svg';
import deleteNodeButtonDisabled from '../images/delete-node-disabled.svg';
import editNodeButton from '../images/edit-node.svg';
import fileExportButton from '../images/file-export.svg';
import fileImportButton from '../images/file-import.svg';
import fileNewButton from '../images/file-new.svg';
import fileOpenButton from '../images/file-open.svg';
import fileSaveButton from '../images/file-save.svg';
import hamburgerMenuButton from '../images/hamburger-button.svg';
import miscFileOpsButton from '../images/misc-file-ops.svg';
import redoButton from '../images/redo.svg';
import redoButtonDisabled from '../images/redo-disabled.svg';
import undoButton from '../images/undo.svg';
import undoButtonDisabled from '../images/undo-disabled.svg';
import { saveDocument } from '../utils/file';

const MENU_ICONS_HEIGHT = 40;
const MENU_ICONS_WIDTH = 40;
const MENU_ICONS_MARGIN = 2;

export const MENU_HEIGHT = MENU_ICONS_HEIGHT + MENU_ICONS_MARGIN;

/**
 * A component that contains the current user menu
 *
 * @returns An object to be consumed by m()
 */
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
    }

    function getFileOperationsMarkup(): m.Vnode {
        return m(
            'div',
            { style: 'text-align: right' },
            [
                // Misc File Ops
                m(
                    'img',
                    {
                        onclick: () => state.ui.setCurrentModal('miscFileOps'),
                        src: miscFileOpsButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                    },
                ),

                // Export
                m(
                    'img',
                    {
                        onclick: () => state.ui.setCurrentModal('fileExport'),
                        src: fileExportButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                    },
                ),

                // Import
                m(
                    'img',
                    {
                        onclick: () => state.ui.setCurrentModal('fileImport'),
                        src: fileImportButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                    },
                ),

                // New
                m(
                    'img',
                    {
                        onclick: onFileNewButtonClick,
                        src: fileNewButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                    },
                ),

                // Save
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

                // Open
                m(
                    'img',
                    {
                        src: fileOpenButton,
                        width: MENU_ICONS_WIDTH,
                        height: MENU_ICONS_HEIGHT,
                        style: 'margin: 2px;',
                        onclick: onFileOpenButtonClick,
                    },
                ),

                // m('button', 'New'),

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
        state.doc.deleteNode(state.doc.getSelectedNodeId());
    }

    function onFileNewButtonClick() {
        if (state.doc.hasUnsavedChanges()) {
            state.ui.setCurrentModal('binaryModal');
            state.ui.setBinaryModalAttrs({
                prompt: 'Current document has unsaved changes. Discard changes and load new document?',
                yesButtonText: 'Yes',
                noButtonText: 'No',
                onYesButtonClick: () => {
                    state.doc.replaceCurrentDocWithNewEmptyDoc();
                    state.ui.setCurrentModal('none');
                },
                onNoButtonClick: () => state.ui.setCurrentModal('none'),
            });
        } else {
            state.doc.replaceCurrentDocWithNewEmptyDoc();
        }
    }

    function onFileOpenButtonClick() {
        if (state.doc.hasUnsavedChanges()) {
            state.ui.setCurrentModal('binaryModal');
            state.ui.setBinaryModalAttrs({
                prompt: 'Current document has unsaved changes. Discard changes to load next document?',
                yesButtonText: 'Yes',
                noButtonText: 'No',
                onYesButtonClick: () => {
                    state.ui.setCurrentModal('fileOpen');
                },
                onNoButtonClick: () => state.ui.setCurrentModal('none'),
            });
        } else {
            state.ui.setCurrentModal('fileOpen');
        }
    }

    function onRedoButtonClick() {
        state.doc.redo();
    }

    function onReplaceNodeContentsButtonClick() {
        state.ui.setCurrentModal('editNode');
    }

    function onSaveButtonClick() {
        const docName = state.doc.getDocName();
        if (docName === '') {
            state.ui.setCurrentModal('fileSave');
        } else {
            const returnVal = saveDocument(
                true,
                docName,
                state.doc.getCurrentDocAsJson(),
            );
            console.log(returnVal);
        }
    }

    function onUndoButtonButtonClick() {
        state.doc.undo();
    }

    return {
        view: (): m.Vnode => {
            const optionalEditUi = state.ui.getCurrentMenu() === 'edit'
                ? getEditOperationsMarkup(
                    state.doc.getRootNodeId(),
                    state.doc.getSelectedNodeId(),
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
