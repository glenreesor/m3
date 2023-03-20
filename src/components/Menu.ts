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

import state from '../state/state';
import EditMenu from './menus/EditMenu';
import FileMenu from './menus/FileMenu';
import MoveNodeMenu from './menus/MoveNodeMenu';
import SizeSettingsMenu from './menus/SizeSettingsMenu';
import UndoRedoMenu from './menus/UndoRedoMenu';
import BookmarksMenu from './menus/BookmarksMenu';

/**
 * A component that renders the current menu
 *
 * @returns An object to be consumed by m()
 */
function Menu(): m.Component {
    return {
        view: (): m.Vnode => {
            switch (state.ui.getCurrentMenu()) {
            case 'edit':
                return m(EditMenu);

            case 'file':
                return m(FileMenu);

            case 'moveNode':
                return m(MoveNodeMenu);

            case 'sizeSettings':
                return m(SizeSettingsMenu);

            case 'undoRedo':
                return m(UndoRedoMenu);

            case 'bookmarks':
                return m(BookmarksMenu);

            default:
                return m('');
            }
        },
    };
}

export default Menu;
