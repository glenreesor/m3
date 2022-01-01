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
        view: (): m.Vnode => m(
            'div',
            { style: 'text-align: right' },
            [
                // Move node up
                m(
                    'button',
                    {
                        onclick: onMoveNodeUpButtonClick,
                        style: {
                            marginRight: '20px',
                        },
                    },
                    'Up',
                ),
                // Decrease font size
                m(
                    'button',
                    {
                        onclick: onMoveNodeDownButtonClick,
                        style: {
                            marginRight: '20px',
                        },
                    },
                    'Down',
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
        ),
    };
}

function onMoveNodeDownButtonClick() {
    state.doc.moveNodeDownInSiblingList(state.doc.getSelectedNodeId());
}

function onMoveNodeUpButtonClick() {
    state.doc.moveNodeUpInSiblingList(state.doc.getSelectedNodeId());
}

export default MoveNodeMenu;
