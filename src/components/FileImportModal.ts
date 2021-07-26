import * as m from 'mithril';

export interface FileImportModalAttributes {
    onCancel: () => void,
    onFileContentsRead: (fileContents: string) => void,
}

/**
 * A component that prompts the user to select a file from their device's
 * filesystem, then attempts to load that as the current document.
 *
 * @returns An object to be consumed by m()
 */
function FileImportModal(): m.Component<FileImportModalAttributes> {
    function getButtonMarkup(attrs: FileImportModalAttributes) {
        return m(
            'div',
            {
                style: {
                    marginTop: '20px',
                    textAlign: 'right',
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

    function getFileImportModalMarkup(attrs: FileImportModalAttributes): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    background: '#dddddd',
                    padding: '10px',
                    border: '2px solid blue',
                    fontSize: '14px',
                    position: 'fixed',
                    left: '50%',
                    top: '35%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '20',
                },
            },
            [
                m(
                    'div',
                    'Import Freemind or m3 document',
                    m(
                        'input',
                        {
                            style: 'padding-top: 25px',
                            type: 'file',
                            onchange: (e: Event) => onFileSelected(attrs, e),
                        },
                    ),
                ),
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
                    zIndex: '10',
                },
            },
        );
    }

    function onFileSelected(attrs: FileImportModalAttributes, e: Event) {
        const fileList = (e.target as HTMLInputElement).files;

        if (fileList !== null) {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                attrs.onFileContentsRead(fileReader.result as string);
            };
            fileReader.readAsText(fileList[0]);
        }
    }

    return {
        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getFileImportModalMarkup(attrs),
            ],
        ),
    };
}

export default FileImportModal;
