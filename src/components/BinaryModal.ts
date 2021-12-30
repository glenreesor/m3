import * as m from 'mithril';

export interface BinaryModalAttributes {
    prompt: string,
    yesButtonText: string,
    noButtonText: string,
    onYesButtonClick: () => void,
    onNoButtonClick: () => void,
}

/**
 * A component that presents a modal with two buttons, where the modal text,
 * button text, and button actions are determined by props.
 *
 * @returns An object to be consumed by m()
 */
function BinaryModal(): m.Component<BinaryModalAttributes> {
    function getBinaryModalMarkup(attrs: BinaryModalAttributes): m.Vnode {
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
                attrs.prompt,
                getButtonsMarkup(attrs),
            ],
        );
    }

    function getButtonsMarkup(attrs: BinaryModalAttributes) {
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
                    {
                        style: 'margin-right: 10px',
                        onclick: attrs.onYesButtonClick,
                    },
                    attrs.yesButtonText,
                ),
                m(
                    'button',
                    { onclick: attrs.onNoButtonClick },
                    attrs.noButtonText,
                ),
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

    return {
        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getBinaryModalMarkup(attrs),
            ],
        ),
    };
}

export default BinaryModal;
