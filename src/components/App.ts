import * as m from 'mithril';

import Document from './DisplayedDocument';
import UserActions from './UserActions';
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
            height: window.innerHeight - 200, // Hack for stuff at top for now
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
            const docName = state.document.getDocName();
            const isModified = state.document.getIsModified();

            return m(
                'div',
                m(UserActions),
                m(
                    'div',
                    `${docName} ${isModified ? '(Modified)' : ''}`,
                ),

                m(
                    Document,
                    {
                        documentDimensions: getDocumentDimensions(),
                    },
                ),
            );
        },
    };
}

export default App;
