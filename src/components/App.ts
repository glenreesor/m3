import * as m from 'mithril';

import Document from './DisplayedDocument';
import DocumentHeader from './DocumentHeader';
import UserActions, { MENU_HEIGHT } from './UserActions';
import state from '../state/state';

/**
 * The m3 app entry point
 */
function App(): m.Component {
    /**
     * Get the dimensions to be used for the document
     *
     * @returns The dimensions
     */
    function getDocumentDimensions(): {width: number, height: number} {
        return {
            width: window.innerWidth - 20,

            // Hack for now
            height: window.innerHeight - MENU_HEIGHT - 12 - 35,
        };
    }

    function onWindowResize() {
        m.redraw();
    }

    return {
        oncreate: () => {
            window.addEventListener('resize', onWindowResize);
        },

        onremove: () => {
            window.removeEventListener('resize', onWindowResize);
        },

        view: (): m.Vnode => {
            const documentName = state.document.getDocName();
            const isModified = state.document.getIsModified();

            return m('div',
                m(DocumentHeader, { documentName, isModified }),
                m(Document, { documentDimensions: getDocumentDimensions() }),
                m(UserActions));
        },
    };
}

export default App;
