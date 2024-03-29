// Copyright 2022 Glen Reesor
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

import addChildButton from './images/add-child.svg';
import addSiblingButton from './images/add-sibling.svg';
import addSiblingButtonDisabled from './images/add-sibling-disabled.svg';
import deleteNodeButton from './images/delete-node.svg';
import deleteNodeButtonDisabled from './images/delete-node-disabled.svg';
import editNodeButton from './images/edit-node.svg';
import hamburgerMenuButton from './images/hamburger-button.svg';

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
                {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                    },
                },

                [
                // Save Button -- not really an "Edit" thing, but put it here
                // for user convenience
                    m(
                        'div',
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
                    ),
                ],
                [
                    m(
                        'div',
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
                    ),
                ],
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

function onReplaceNodeContentsButtonClick() {
    state.ui.setCurrentModal('editNode');
}

export default EditMenu;
