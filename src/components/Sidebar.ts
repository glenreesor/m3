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
                            bottom: '40px',
                            right: '0',
                            'font-size': `${state.ui.getCurrentFontSize()}px`,
                            width: '100px',
                            height: `${state.ui.getCurrentFontSize() * 14}px`,
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
                    ],
                ),
            ],
        ),
    };
}

export default Sidebar;
