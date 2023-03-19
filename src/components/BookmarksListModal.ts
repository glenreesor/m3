// Copyright 2023 Glen Reesor
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

export interface BookmarksListModalAttributes {
    onCancel: () => void,
    onBookmarkSelected: (nodeId: number) => void,
}

/**
 * A component that presents the list of bookmarked nodes and allows the user
 * to select one to navigate to
 *
 * @returns An object to be consumed by m()
 */
function BookmarksListModal(): m.Component<BookmarksListModalAttributes> {
    function getButtonMarkup(attrs: BookmarksListModalAttributes) {
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

    function getCurrentBookmarksMarkup(attrs: BookmarksListModalAttributes) {
        const bookmarkedNodes = state.doc.getBookmarkedNodeIds().map(
            (nodeId) => ({ nodeId, name: state.doc.getNodeContents(nodeId) }),
        );
        const sortedBookmarkedNodes = bookmarkedNodes.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        const currentBookmarksMarkup: Array<m.Vnode> = [];
        sortedBookmarkedNodes.forEach((node, index) => {
            currentBookmarksMarkup.push(
                m(
                    'div',
                    {
                        // TODO: Fix using nth child stuff
                        style: {
                            background: '#ffffff',
                            fontSize: `${state.ui.getCurrentFontSize()}px`,
                            paddingTop: index === 0 ? '10px' : '0',
                            paddingBottom: '10px',
                            paddingLeft: '20px',
                            paddingRight: '20px',
                        },
                        onclick: () => attrs.onBookmarkSelected(node.nodeId),
                    },
                    node.name,
                ),
            );
        });

        return m(
            'div',
            {
                style: {
                    height: '100px',
                    overflow: 'auto',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '55px',

                    // TODO: Make this a non-hack
                    width: '200px',
                    maxWidth: '75%',
                },
            },
            currentBookmarksMarkup,
        );
    }

    function getBookmarksListModalMarkup(attrs: BookmarksListModalAttributes): m.Vnode {
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
                getCurrentBookmarksMarkup(attrs),
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

    return {
        view: ({ attrs }): m.Vnode => m(
            'div',
            [
                getOverlayMarkup(),
                getBookmarksListModalMarkup(attrs),
            ],
        ),
    };
}

export default BookmarksListModal;
