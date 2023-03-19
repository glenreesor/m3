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

export interface BinaryModalAttributes {
    prompt: string,
    yesButtonText: string,
    noButtonText: string,
    onYesButtonClick: () => void,
    onNoButtonClick: () => void,
}

/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to UI properties.
 * See return object for action functions.
 */
export default (() => {
    type ModalType = (
        'none' |
        'addChild' |
        'addSibling' |
        'binaryModal' |
        'bookmarksList' |
        'editNode' |
        'fileExport' |
        'fileImport' |
        'fileOpen' |
        'fileSave' |
        'miscFileOps'
    );
    type MenuType = 'edit' | 'file' | 'moveNode' | 'sizeSettings' | 'undoRedo' | 'bookmarks';

    interface State {
        binaryModalAttrs?: BinaryModalAttributes,
        currentMenu: MenuType,
        currentModal: ModalType,
        fontSize: number,
        sidebarIsVisible: boolean,
    }

    const state: State = {
        binaryModalAttrs: undefined,
        currentMenu: 'edit',
        currentModal: 'none',
        fontSize: 14,
        sidebarIsVisible: false,
    };

    return {
        getBinaryModalAttrs: () => state.binaryModalAttrs,
        setBinaryModalAttrs: (attrs: BinaryModalAttributes) => {
            state.binaryModalAttrs = attrs;
        },

        getCurrentMenu: () => state.currentMenu,
        setCurrentMenu: (menu: MenuType) => { state.currentMenu = menu; },

        getCurrentModal: () => state.currentModal,
        setCurrentModal: (modal: ModalType) => { state.currentModal = modal; },

        getCurrentFontSize: () => state.fontSize,
        setCurrentFontSize: (newSize: number) => {
            state.fontSize = newSize;
        },

        getSidebarIsVisible: () => state.sidebarIsVisible,
        setSidebarVisibility: (visible: boolean) => {
            state.sidebarIsVisible = visible;
        },
    };
})();
