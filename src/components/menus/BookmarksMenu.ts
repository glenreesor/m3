// Copyright 2023 Glen Reesor
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

import { MENU_ICONS_HEIGHT, MENU_ICONS_WIDTH } from './constants';

/**
 * A component that renders the Move Node menu
 *
 * @returns An object to be consumed by m()
 */
function MoveNodeMenu(): m.Component {
    return {
        view: (): m.Vnode =>  {
            const selectedNodeId = state.doc.getSelectedNodeId();
            const currentNodeIsBookmarked = state.doc.getBookmarkedNodeIds()
                .includes(selectedNodeId);

            return m(
                'div',
                { style: 'text-align: right' },
                [
                    // Move node up
                    m(
                        'button',
                        {
                            onclick: () => state.doc.addBookmark(selectedNodeId),
                            disabled: currentNodeIsBookmarked,
                            style: {
                                marginRight: '20px',
                            },
                        },
                        'Bookmark Node',
                    ),
                    // Decrease font size
                    m(
                        'button',
                        {
                            onclick: () => state.doc.removeBookmark(selectedNodeId),
                            disabled: !currentNodeIsBookmarked,
                            style: {
                                marginRight: '20px',
                            },
                        },
                        'Unbookmark Node',
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
                ],
            );
        },
    };
}

export default MoveNodeMenu;
