/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to the user's loaded document.
 * See return object for action functions.
 */
export default (() => {
    // Parts of user's document that are affected by editing, including undo
    // and redo
    interface Document {
        nodes: Map<
            number,
            {
                id: number,
                contents: string,
                childIds: Array<number>,
            }
        >,
        highestNodeId: number,
        rootId: number,
    }

    // Full state
    interface State {
        // Index into docHistory[] for the current state of the document.
        // Each operation on user's document will add a new element to docHistory[],
        // thus modifying this value implements undo / redo
        currentDocIndex: number,

        // An array where each element represents the user's document at a
        // given point in time. i.e.:
        //      documentHistory[0] Contains the initial version of the document
        //      documentHistory[1] Contains the document after first edit
        //      etc.
        docHistory: Array<Document>,

        // Name of document as it exists outside of m3 (e.g. filesystem)
        docName: string,

        // Whether document has been modified since last save
        isModified: boolean,

        // The ID of the currently selected node
        selectedNodeId: number,
    }

    // Initial hard-coded doc to be used for testing new functionality
    const initialDoc = {
        nodes: (new Map())
            .set(
                0,
                {
                    id: 0,
                    contents: 'New Map',
                    childIds: [1, 2, 3],
                },
            )
            .set(
                1,
                {
                    id: 1,
                    contents: 'First Child Node',
                    childIds: [4, 5],
                },
            )
            .set(
                2,
                {
                    id: 2,
                    contents: 'Second Child Node',
                    childIds: [],
                },
            )
            .set(
                3,
                {
                    id: 3,
                    contents: 'Third Child Node',
                    childIds: [6, 7, 8],
                },
            )
            .set(
                4,
                {
                    id: 4,
                    contents: 'First child of first child',
                    childIds: [],
                },
            )
            .set(
                5,
                {
                    id: 5,
                    contents: 'Second child of first child',
                    childIds: [],
                },
            )
            .set(
                6,
                {
                    id: 6,
                    contents: 'First child of third child',
                    childIds: [],
                },
            )
            .set(
                7,
                {
                    id: 7,
                    contents: 'Second child of third child',
                    childIds: [],
                },
            )
            .set(
                8,
                {
                    id: 8,
                    contents: 'Third child of third child',
                    childIds: [],
                },
            ),
        highestNodeId: 8,
        rootId: 0,
    };

    const state: State = {
        currentDocIndex: 0,
        docHistory: [initialDoc],
        docName: 'New Map',
        isModified: true,
        selectedNodeId: 0,
    };

    /**
     * A helper function to get state.docHistory[state.currentDocIndex]
     *
     * @returns The current doc
     */
    function getCurrentDoc(): Document {
        return state.docHistory[state.currentDocIndex];
    }

    return {
        /**
         * Return the name of the current document
         *
         * @returns The doc name
         */
        getDocName: ():string => state.docName,

        /**
         * Return whether the current document has been modified since last
         * load / save
         *
         * @returns Whether doc has been modified
         */
        getIsModified: ():boolean => state.isModified,

        /**
         * Return a copy of the child IDs of the specified node.
         * Throw an exception if specified nodeId does not exist.
         *
         * @param nodeId The ID of the node whose children we want returned
         *
         * @returns The node's children
         */
        getNodeChildIds: (nodeId: number):Array<number> => {
            const node = getCurrentDoc().nodes.get(nodeId);

            if (node !== undefined) return node.childIds.slice();

            throw new Error(
                `getNodeChildIds(): nodeId '${nodeId}' is not present in document`,
            );
        },

        /**
         * Return the contents of the specified node.
         * Throw an exception if specified nodeId does not exist.
         *
         * @param nodeId The ID of the node whose contents we want returned
         *
         * @returns The node's contents
         */
        getNodeContents: (nodeId: number):string => {
            const node = getCurrentDoc().nodes.get(nodeId);

            if (node !== undefined) return node.contents;

            throw new Error(
                `getNodeContents(): nodeId '${nodeId}' is not present in document`,
            );
        },

        /**
         * Get the ID of the root node
         *
         * @returns The ID
         */
        getRootNodeId: ():number => getCurrentDoc().rootId,

        /**
         * Get the ID of the currently selected node
         *
         * @returns The ID
         */
        getSelectedNodeId: ():number => state.selectedNodeId,

        /**
         * Set the currently selected node to the specified one
         *
         * @param nodeId The new selected node
         */
        setSelectedNodeId: (nodeId: number) => {
            state.selectedNodeId = nodeId;
        },
    };
})();
