import * as m from 'mithril';

export interface TextInputModalAttributes {
    initialValue: string,
    onCancel: () => void,
    onSave: (text: string) => void,
}

/**
 * A component that contains a text input element in a centered modal
 *
 * @returns An object to be consumed by m()
 */
function TextInputModal(): m.Component<TextInputModalAttributes> {
    let inputValue = '';

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

    function getEditModalMarkup(attrs: TextInputModalAttributes): m.Vnode {
        return m(
            'div',
            {
                // TODO: Don't use embedded styles
                style: {
                    background: '#ffffff',
                    padding: '10px',
                    border: '2px solid blue',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    'z-index': '20',
                },
            },
            [
                m(
                    'input',
                    {
                        value: inputValue,
                        style: `width: ${window.innerWidth / 2}px`,
                        oninput: onInputValueChange,
                        onkeyup: (e: KeyboardEvent) => onInputKeyUp(e, attrs),
                    },
                ),
                m(
                    'br',
                ),
                m(
                    'button',
                    {
                        style: 'margin-top: 2px;',
                        onclick: () => attrs.onSave(inputValue),
                    },
                    'Save',
                ),
                m(
                    'button',
                    {
                        style: 'margin-top: 2px;',
                        onclick: attrs.onCancel,
                    },
                    'Cancel',
                ),
            ],
        );
    }

    function onInputKeyUp(e: KeyboardEvent, attrs: TextInputModalAttributes) {
        if (e.key === 'Enter') {
            attrs.onSave(inputValue);
        } else if (e.key === 'Escape') {
            attrs.onCancel();
        }
    }

    function onInputValueChange(e: Event) {
        if (e.target !== null) {
            inputValue = ((e.target) as HTMLInputElement).value;
        }
    }

    return {
        oninit: ({ attrs }) => {
            inputValue = attrs.initialValue;
        },

        oncreate: (node) => {
            node.dom.getElementsByTagName('input')[0].focus();
        },

        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getEditModalMarkup(attrs),
            ],
        ),
    };
}

export default TextInputModal;
