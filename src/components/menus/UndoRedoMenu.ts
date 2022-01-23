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

import hamburgerMenuButton from './images/hamburger-button.svg';
import redoButton from './images/redo.svg';
import redoButtonDisabled from './images/redo-disabled.svg';
import undoButton from './images/undo.svg';
import undoButtonDisabled from './images/undo-disabled.svg';

import { MENU_ICONS_HEIGHT, MENU_ICONS_WIDTH } from './constants';

/**
 * A component that renders the Undo/Redo menu
 *
 * @returns An object to be consumed by m()
 */
function UndoRedoMenu(): m.Component {
    return {
        view: (): m.Vnode => m(
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
    };
}

function onRedoButtonClick() {
    if (state.doc.getRedoIsAvailable()) {
        state.doc.redo();
    }
}

function onUndoButtonButtonClick() {
    if (state.doc.getUndoIsAvailable()) {
        state.doc.undo();
    }
}

export default UndoRedoMenu;
