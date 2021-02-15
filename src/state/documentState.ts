import produce, { enableAllPlugins } from 'immer';

enableAllPlugins();

/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to the user's loaded document.
 * See return object for action functions.
 */
export default (() => {
    // One Node in user's document
    interface Node {
        id: number,
        contents: string,
        childIds: Array<number>,
        childrenVisible: boolean,
    }

    // Parts of user's document that are affected by editing, including undo
    // and redo
    interface Document {
        nodes: Map<number, Node>,
        highestNodeId: number,
        rootId: number,

        // The ID of the currently selected node
        selectedNodeId: number,
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
    }

    // Initial hard-coded doc to be used for testing new functionality
    const initialDoc = {
        selectedNodeId: 0,
        nodes: (new Map() as Map<number, Node>)
            .set(
                0,
                {
                    id: 0,
                    contents: 'New Map',
                    childIds: [1, 2, 3],
                    childrenVisible: true,
                },
            )
            .set(
                1,
                {
                    id: 1,
                    contents: 'First Child Node',
                    childIds: [4, 5],
                    childrenVisible: true,
                },
            )
            .set(
                2,
                {
                    id: 2,
                    contents: 'Second Child Node',
                    childIds: [],
                    childrenVisible: true,
                },
            )
            .set(
                3,
                {
                    id: 3,
                    contents: 'Third Child Node',
                    childIds: [6, 7, 8],
                    childrenVisible: true,
                },
            )
            .set(
                4,
                {
                    id: 4,
                    contents: 'First child of first child',
                    childIds: [],
                    childrenVisible: true,
                },
            )
            .set(
                5,
                {
                    id: 5,
                    contents: 'Second child of first child',
                    childIds: [],
                    childrenVisible: true,
                },
            )
            .set(
                6,
                {
                    id: 6,
                    contents: 'First child of third child',
                    childIds: [],
                    childrenVisible: true,
                },
            )
            .set(
                7,
                {
                    id: 7,
                    contents: 'Second child of third child',
                    childIds: [],
                    childrenVisible: true,
                },
            )
            .set(
                8,
                {
                    id: 8,
                    contents: 'Third child of third child',
                    childIds: [],
                    childrenVisible: true,
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
    };

    /**
     * A helper function to get state.docHistory[state.currentDocIndex]
     *
     * @returns The current doc
     */
    function getCurrentDoc(): Document {
        return state.docHistory[state.currentDocIndex];
    }

    /**
     * Return whether a redo step is available
     *
     * @returns Whether redo can be performed
     */
    function redoAvailable(): boolean {
        const lastIndex = state.docHistory.length - 1;

        return (lastIndex > state.currentDocIndex);
    }

    /**
     * Helper function to get the specified node from specified document (
     * defaults to current doc).
     *
     * Throws an error if node not found
     *
     * @param nodeId    The ID of the node to get
     * @param callingFn The name of the calling function, for exception message
     * @param doc       The document to search in
     *
     * @returns Node The node
     */
    function safeGetNode(nodeId: number, callingFn: string, doc = getCurrentDoc()): Node {
        const node = doc.nodes.get(nodeId);

        if (node !== undefined) return node;

        throw new Error(
            `safeGetNode() nodeId '${nodeId}' is not present in document. Called from ${callingFn}`,
        );
    }

    /**
     * Return whether an undo step is available
     *
     * @returns Whether undo can be performed
     */
    function undoAvailable(): boolean {
        return state.currentDocIndex > 0;
    }

    return {
        /**
         * Add a child with the specified contents to the specified parent node
         *
         * @param parentNodeId The ID of the parent
         * @param childContents The contents for the new node
         */
        addChild: (parentNodeId: number, childContents: string) => {
            const newDoc = produce(getCurrentDoc(), (draftDocument) => {
                const newChildId = draftDocument.highestNodeId + 1;
                const parentNode = safeGetNode(parentNodeId, 'addChild', draftDocument);
                const newChild = {
                    id: newChildId,
                    contents: childContents,
                    childIds: [],
                    childrenVisible: true,
                };

                /* eslint-disable no-param-reassign */
                draftDocument.highestNodeId = newChildId;
                parentNode.childIds.push(newChildId);
                draftDocument.nodes.set(newChildId, newChild);
            });

            // Delete any states after the current one (i.e. redo states) since
            // they will no longer be valid
            state.docHistory.splice(state.currentDocIndex + 1);

            // Now add the current one
            state.currentDocIndex += 1;
            state.docHistory.push(newDoc);
        },

        /**
         * Get whether the children of the specified node are visible
         *
         * @param nodeId The node in question
         *
         * @returns Whether the children are visible
         */
        getChildrenVisible: (nodeId: number):boolean => safeGetNode(
            nodeId,
            'getChildrenVisible',
        ).childrenVisible,

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
        getNodeChildIds: (nodeId: number):Array<number> => safeGetNode(
            nodeId,
            'getNodeChildIds',
        ).childIds.slice(),

        /**
         * Return the contents of the specified node.
         * Throw an exception if specified nodeId does not exist.
         *
         * @param nodeId The ID of the node whose contents we want returned
         *
         * @returns The node's contents
         */
        getNodeContents: (nodeId: number):string => safeGetNode(
            nodeId,
            'getNodeContents',
        ).contents,

        /**
         * Return whether a redo step is available
         *
         * @returns Whether a redo step is available
         */
        getRedoIsAvailable: (): boolean => redoAvailable(),

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
        getSelectedNodeId: ():number => getCurrentDoc().selectedNodeId,

        /**
         * Return whether an undo step is available
         *
         * @returns Whether an undo step is available
         */
        getUndoIsAvailable: (): boolean => undoAvailable(),

        /**
         * Redo the last editor change (do nothing if no redo available)
         */
        redo: () => {
            if (redoAvailable()) {
                state.currentDocIndex += 1;
            }
        },

        /**
         * Set the currently selected node to the specified one
         *
         * @param nodeId The new selected node
         */
        setSelectedNodeId: (nodeId: number) => {
            // We need to use immer since the current state is frozen.
            // However we won't push this new state to docHistory[] since we
            // don't want toggling children visibility to participate in
            // undo / redo functionality
            const newDoc = produce(getCurrentDoc(), (draftDocument) => {
                draftDocument.selectedNodeId = nodeId;
            });

            // As described above, replace the current document with this one
            state.docHistory[state.currentDocIndex] = newDoc;
        },

        /**
         * Toggle visibility of the specified node's children
         *
         * @param nodeId The node in question
         */
        toggleChildrenVisibility: (nodeId: number) => {
            // We need to use immer since the current state is frozen.
            // However we won't push this new state to docHistory[] since we
            // don't want toggling children visibility to participate in
            // undo / redo functionality
            const newDoc = produce(getCurrentDoc(), (draftDocument) => {
                const node = safeGetNode(nodeId, 'toggleChildrenVisibility', draftDocument);
                node.childrenVisible = !node.childrenVisible;
            });

            // As described above, replace the current document with this one
            state.docHistory[state.currentDocIndex] = newDoc;
        },

        /**
         * Undo the last editor change (do nothing if no undo available)
         */
        undo: () => {
            if (undoAvailable()) {
                state.currentDocIndex -= 1;
            }
        },
    };
})();
