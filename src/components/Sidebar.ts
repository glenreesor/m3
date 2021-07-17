import * as m from 'mithril';

import state from '../state/state';

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
                            bottom: '20px',
                            right: '0',
                            'font-size': '14px',
                            width: '100px',
                            height: '100px',
                            'text-align': 'center',
                            'z-index': '20',
                        },
                    },
                    [
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
                    ],
                ),
            ],
        ),
    };
}

export default Sidebar;
