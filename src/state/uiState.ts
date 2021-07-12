/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to UI elements.
 * See return object for action functions.
 */
export default (() => {
    const state = {
        editOpsVisible: false,
        fileOpsVisible: false,
    };

    return {
        /**
         * Return whether the Edit operations (insert, copy, paste, etc) are
         * visible
         *
         * @returns Whether they're visible
         */
        getEditOpsVisible: () => state.editOpsVisible,

        /**
         * Return whether the File operations (open, save, etc) are
         * visible
         *
         * @returns Whether they're visible
         */
        getFileOpsVisible: () => state.fileOpsVisible,

        /**
         * Toggle visibility of Edit operations
         */
        toggleEditOpsVisibility: () => {
            state.editOpsVisible = !state.editOpsVisible;
            if (state.editOpsVisible) {
                state.fileOpsVisible = false;
            }
        },

        /**
         * Toggle visibility of File operations
         */
        toggleFileOpsVisibility: () => {
            state.fileOpsVisible = !state.fileOpsVisible;
            if (state.fileOpsVisible) {
                state.editOpsVisible = false;
            }
        },
    };
})();
