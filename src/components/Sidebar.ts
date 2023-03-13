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

import state from '../state/state';

/**
 * A sidebar on the right side, that is used to change which set of menu icons
 * are shown
 *
 * @returns An object to be consumed by m()
 */
function Sidebar(): m.Component {
    function getOverlayMarkup(): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    position: 'fixed',
                    top: '0px',
                    width: '100%',
                    height: '100vh',
                    'z-index': '10',
                },
                onclick: () => state.ui.setSidebarVisibility(false),
            },
        );
    }

    return {
        view: () => m(
            'div',
            [
                getOverlayMarkup(),
                m(
                    'div',
                    {
                        style: {
                            background: '#eeeeee',
                            position: 'fixed',
                            bottom: '100px',
                            right: '0',
                            'font-size': `${state.ui.getCurrentFontSize()}px`,
                            width: '120px',
                            height: `${state.ui.getCurrentFontSize() * 16}px`,
                            'text-align': 'center',
                            'z-index': '20',
                        },
                    },
                    [
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('file');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'File',
                        ),
                        m('br'),
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('edit');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'Edit',
                        ),
                        m('br'),
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('moveNode');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'Move Node',
                        ),
                        m('br'),
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('sizeSettings');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'Size Settings',
                        ),
                        m('br'),
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('undoRedo');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'Undo / Redo',
                        ),
                        m('br'),
                        m('br'),
                        m(
                            'a',
                            {
                                href: '#',
                                onclick: () => {
                                    state.ui.setCurrentMenu('bookmarks');
                                    state.ui.setSidebarVisibility(false);
                                },
                            },
                            'Bookmarks +/-',
                        ),
                    ],
                ),
            ],
        ),
    };
}

export default Sidebar;
