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

import state from '../../state/state';

import fileExportButton from './images/file-export.svg';
import fileImportButton from './images/file-import.svg';
import fileNewButton from './images/file-new.svg';
import fileOpenButton from './images/file-open.svg';
import fileSaveButton from './images/file-save.svg';
import hamburgerMenuButton from './images/hamburger-button.svg';
import miscFileOpsButton from './images/misc-file-ops.svg';

import { saveDocument } from '../../utils/file';
import { MENU_ICONS_HEIGHT, MENU_ICONS_WIDTH } from './constants';

/**
 * A component that renders the File menu
 *
 * @returns An object to be consumed by m()
 */
function FileMenu(): m.Component {
    return {
        view: (): m.Vnode => m(
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
                        onclick: onFileImportButtonClick,
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
        ),
    };
}

function onFileImportButtonClick() {
    if (state.doc.hasUnsavedChanges()) {
        state.ui.setCurrentModal('binaryModal');
        state.ui.setBinaryModalAttrs({
            prompt: 'Current document has unsaved changes. Discard changes and load new document?',
            yesButtonText: 'Yes',
            noButtonText: 'No',
            onYesButtonClick: () => {
                state.ui.setCurrentModal('fileImport');
            },
            onNoButtonClick: () => state.ui.setCurrentModal('none'),
        });
    } else {
        state.ui.setCurrentModal('fileImport');
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
                state.canvas.resetRootNodeCoords();
            },
            onNoButtonClick: () => state.ui.setCurrentModal('none'),
        });
    } else {
        state.doc.replaceCurrentDocWithNewEmptyDoc();
        state.canvas.resetRootNodeCoords();
    }
}

/**
 * Handle clicking of the save button
 */
export function onSaveButtonClick() {
    const docName = state.doc.getDocName();
    if (docName === '') {
        state.ui.setCurrentModal('fileSave');
    } else {
        const returnVal = saveDocument(
            true,
            docName,
            state.doc.getCurrentDocAsJson(),
        );
        console.log(`Save returnVal: ${returnVal}`);
    }
}

export default FileMenu;
