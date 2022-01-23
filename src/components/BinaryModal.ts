// Copyright 2022 Glen Reesor
//
// This file is part of m3 Mind Mapper.
//
// m3 Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// m3 Mind Mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// m3 Mind Mapper. If not, see <https://www.gnu.org/licenses/>.

import * as m from 'mithril';

import state from '../state/state';
import { BinaryModalAttributes } from '../state/uiState';

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
                    fontSize: `${state.ui.getCurrentFontSize()}px`,
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
