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
