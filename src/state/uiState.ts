/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to UI properties.
 * See return object for action functions.
 */
export default (() => {
    type ModalType = 'none' | 'addChild' | 'addSibling' | 'editNode';

    interface State {
        currentModal: ModalType,
    }

    const state: State = {
        currentModal: 'none',
    };

    return {
        getCurrentModal: () => state.currentModal,
        setCurrentModal: (modal: ModalType) => { state.currentModal = modal; },
    };
})();
