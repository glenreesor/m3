import * as m from 'mithril';

import state from '../state/state';
import EditMenu from './menus/EditMenu';
import FileMenu from './menus/FileMenu';

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

            default:
                return m('');
            }
        },
    };
}

export default Menu;
