import { BinaryModalAttributes } from '../components/BinaryModal';

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
        'editNode' |
        'fileExport' |
        'fileImport' |
        'fileOpen' |
        'fileSave' |
        'miscFileOps'
    );
    type MenuType = 'edit' | 'file' | 'sizeSettings';

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
        fontSize: 12,
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
