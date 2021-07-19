import * as m from 'mithril';

import { getSavedDocumentList } from '../utils/file';

export interface FileOpenModalAttributes {
    onCancel: () => void,
    onFileSelected: (filename: string) => void,
}

/**
 * A component that presents the list of saved documents and allows the user
 * to select which one to load
 *
 * @returns An object to be consumed by m()
 */
function FileOpenModal(): m.Component<FileOpenModalAttributes> {
    function getButtonMarkup(attrs: FileOpenModalAttributes) {
        return m(
            'div',
            {
                style: {
                    'margin-top': '20px',
                    'text-align': 'right',
                },
            },
            [
                m(
                    'button',
                    { onclick: attrs.onCancel },
                    'Cancel',
                ),
            ],
        );
    }

    function getCurrentDocsMarkup(attrs: FileOpenModalAttributes) {
        const currentFilenamesMarkup:Array<m.Vnode> = [];
        getSavedDocumentList().forEach((filename, index) => {
            currentFilenamesMarkup.push(
                m(
                    'div',
                    {
                        // TODO: Fix using nth child stuff
                        style: {
                            background: '#ffffff',
                            'padding-top': index === 0 ? '10px' : '0',
                            'padding-bottom': '10px',
                            'padding-left': '20px',
                            'padding-right': '20px',
                        },
                        onclick: () => attrs.onFileSelected(filename),
                    },
                    filename,
                ),
            );
        });

        return m(
            'div',
            {
                style: {
                    height: '100px',
                    overflow: 'auto',
                    'padding-top': '10px',
                    'padding-bottom': '10px',
                    'padding-left': '55px',
                },
            },
            currentFilenamesMarkup,
        );
    }

    function getFileOpenModalMarkup(attrs: FileOpenModalAttributes): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    background: '#dddddd',
                    padding: '10px',
                    border: '2px solid blue',
                    'font-size': '14px',
                    position: 'fixed',
                    left: '50%',
                    top: '35%',
                    transform: 'translate(-50%, -50%)',
                    'z-index': '20',
                },
            },
            [
                getCurrentDocsMarkup(attrs),
                getButtonMarkup(attrs),
            ],
        );
    }

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
                    background: 'rgba(255, 255, 255, 0.5)',
                    'z-index': '10',
                },
            },
        );
    }

    return {
        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getFileOpenModalMarkup(attrs),
            ],
        ),
    };
}

export default FileOpenModal;
