import * as m from 'mithril';

interface DocumentHeaderAttributes {
    documentName: string,
    isModified: boolean,
}

/**
 * Header above the document (name, modified status)
 */
function DocumentHeader(): m.Component<DocumentHeaderAttributes> {
    return {
        view: ({ attrs }): m.Vnode => (
            m(
                'div',
                { style: 'font-size: 12px' },
                `${attrs.documentName} ${attrs.isModified ? '(Modified)' : ''}`,
            )
        ),
    };
}

export default DocumentHeader;
