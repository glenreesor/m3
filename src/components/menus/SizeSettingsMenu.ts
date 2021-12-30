import * as m from 'mithril';

import state from '../../state/state';

import hamburgerMenuButton from './images/hamburger-button.svg';

import { MENU_ICONS_HEIGHT, MENU_ICONS_WIDTH } from './constants';

/**
 * A component that renders the Size Settings menu
 *
 * @returns An object to be consumed by m()
 */
function SizeSettingsMenu(): m.Component {
    return {
        view: (): m.Vnode => m(
            'div',
            { style: 'text-align: right' },
            [
                // Increase font size
                m(
                    'button',
                    {
                        onclick: onFontSizeIncreaseButtonClick,
                    },
                    'Font +',
                ),
                // Decrease font size
                m(
                    'button',
                    {
                        onclick: onFontSizeDecreaseButtonClick,
                    },
                    'Font -',
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

function onFontSizeDecreaseButtonClick() {
    state.ui.setCurrentFontSize(
        state.ui.getCurrentFontSize() - 0.5,
    );
}

function onFontSizeIncreaseButtonClick() {
    state.ui.setCurrentFontSize(
        state.ui.getCurrentFontSize() + 0.5,
    );
}

export default SizeSettingsMenu;
