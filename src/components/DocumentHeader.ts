import * as m from 'mithril';

import state from '../state/state';

interface DocumentHeaderAttributes {
    documentName: string,
    hasUnsavedChanges: boolean,
}

/**
 * A component that contains the header to be shown above the document
 * (name, modified status)
 *
 * @returns A component to be consumed by m()
 */
function DocumentHeader(): m.Component<DocumentHeaderAttributes> {
    return {
        view: ({ attrs }): m.Vnode => {
            const docName = attrs.documentName === '' ? 'New Map' : attrs.documentName;
            const modifiedIndicator = attrs.hasUnsavedChanges ? ' (Modified)' : '';

            return m(
                'div',
                { style: `font-size: ${state.ui.getCurrentFontSize()}px` },
                docName,
                m(
                    'span',
                    { style: 'color: blue' },
                    modifiedIndicator,
                ),
            );
        },
    };
}

export default DocumentHeader;
