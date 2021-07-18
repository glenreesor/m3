import * as m from 'mithril';

interface DocumentHeaderAttributes {
    documentName: string,
    isModified: boolean,
}

/**
 * A component that contains the header to be shown above the document
 * (name, modified status)
 *
 * @returns A component to be consumed by m()
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
