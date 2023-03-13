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
        parentId: number | undefined,
    }

    // Parts of user's document that are affected by editing, including undo
    // and redo
    interface Doc {
        rootId: number,
        highestNodeId: number,
        selectedNodeId: number,

        bookmarkedNodeIds: number[],
        nodes: Map<number, Node>,
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
        docHistory: Array<Doc>,

        // Name of document as it exists outside of m3 (e.g. filesystem)
        docName: string,

        // Whether document has been modified since last save
        hasUnsavedChanges: boolean,
    }

    let state: State = {
        currentDocIndex: 0,
        docHistory: [getInitialEmptyDoc()],
        docName: '',
        hasUnsavedChanges: true,
    };

    function applyNewDocToUndoStack(newDoc: Doc) {
        // Delete any states after the current one (i.e. redo states) since
        // they will no longer be valid
        state.docHistory.splice(state.currentDocIndex + 1);

        // Now add the current one
        state.currentDocIndex += 1;
        state.docHistory.push(newDoc);

        state.hasUnsavedChanges = true;
    }

    /**
     * A helper function to get state.docHistory[state.currentDocIndex]
     *
     * @returns The current doc
     */
    function getCurrentDoc(): Doc {
        return state.docHistory[state.currentDocIndex];
    }

    function getInitialEmptyDoc(): Doc {
        const rootNodeId = 0;
        const rootNode = {
            id: rootNodeId,
            contents: 'New Map',
            childIds: [],
            childrenVisible: true,
            parentId: undefined,
        };
        const initialDoc = {
            rootId: rootNodeId,
            highestNodeId: rootNodeId,
            selectedNodeId: rootNodeId,

            bookmarkedNodeIds: [],
            nodes: (new Map() as Map<number, Node>).set(rootNodeId, rootNode),
        };

        return initialDoc;
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
        addBookmark: (bookmarkToAdd: number) => {
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                /* eslint-disable no-param-reassign */
                draftDoc.bookmarkedNodeIds = [
                    ...draftDoc.bookmarkedNodeIds,
                    bookmarkToAdd,
                ];
            });

            // Not sure having bookmarks participate in undo/redo is best
            // user experience, but having to manage stale bookmarked nodes
            // would be challenging
            applyNewDocToUndoStack(newDoc);
        },

        /**
         * Add a child with the specified contents to the specified parent node
         *
         * @param parentNodeId  The ID of the parent
         * @param childContents The contents for the new node
         * @returns The ID of the newly added node
         */
        addChild: (parentNodeId: number, childContents: string): number => {
            let newChildId = -1;
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                newChildId = draftDoc.highestNodeId + 1;
                const parentNode = safeGetNode(parentNodeId, 'addChild', draftDoc);
                const newChild = {
                    id: newChildId,
                    contents: childContents,
                    childIds: [],
                    childrenVisible: true,
                    parentId: parentNode.id,
                };

                /* eslint-disable no-param-reassign */
                draftDoc.highestNodeId = newChildId;
                parentNode.childIds.push(newChildId);
                draftDoc.nodes.set(newChildId, newChild);
            });

            applyNewDocToUndoStack(newDoc);

            return newChildId;
        },

        /**
         * Add a sibling to the specified node using the specified contents.
         * The added node will be after the specified node.
         *
         * @param siblingNodeId The ID of the node this will be a sibling to
         * @param childContents The contents for the new node
         * @returns The ID of the newly added node or -1 if the specified
         *          sibling node is the root.
         */
        addSibling: (siblingNodeId: number, childContents: string): number => {
            const siblingNode = safeGetNode(siblingNodeId, 'addSibling');
            const parentNodeId = siblingNode.parentId;
            let newChildId = -1;

            if (parentNodeId === undefined) return -1;

            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                newChildId = draftDoc.highestNodeId + 1;
                const parentNode = safeGetNode(
                    parentNodeId,
                    'addSibling',
                    draftDoc,
                );
                const newChild = {
                    id: newChildId,
                    contents: childContents,
                    childIds: [],
                    childrenVisible: true,
                    parentId: parentNodeId,
                };

                /* eslint-disable no-param-reassign */
                draftDoc.highestNodeId = newChildId;

                const allSiblings = parentNode.childIds;
                const siblingNodeIndex = allSiblings.indexOf(siblingNodeId);

                allSiblings.splice(
                    siblingNodeIndex + 1,
                    0,
                    newChildId,
                );

                parentNode.childIds = allSiblings;
                draftDoc.nodes.set(newChildId, newChild);
            });

            applyNewDocToUndoStack(newDoc);

            return newChildId;
        },

        /**
         * Delete the node with the specified ID
         *
         * @param nodeToDeleteId ID of the node to be deleted
         */
        deleteNode(nodeToDeleteId: number) {
            const nodeToDelete = safeGetNode(nodeToDeleteId, 'addSibling');
            const parentNodeId = nodeToDelete.parentId;

            if (parentNodeId === undefined) return;

            const newDoc = produce(getCurrentDoc(), (draftDocment) => {
                function depthFirstDelete(nodeId: number) {
                    const node = safeGetNode(nodeId, 'deleteNode', draftDocment);
                    node.childIds.forEach((childId) => {
                        depthFirstDelete(childId);
                    });
                    draftDocment.nodes.delete(nodeId);

                    // Make sure bookmark list doesn't include this node
                    /* eslint-disable no-param-reassign */
                    draftDocment.bookmarkedNodeIds = draftDocment.bookmarkedNodeIds.filter(
                        (bookmarkedNodeId) => bookmarkedNodeId !== nodeId,
                    );
                }

                // Remove all nodes from the Set then remove the specified
                // node from its parent's child list
                depthFirstDelete(nodeToDeleteId);

                const parentNode = safeGetNode(parentNodeId, 'deleteNode', draftDocment);
                const indexOfNodeToDelete = parentNode.childIds.indexOf(nodeToDeleteId);
                parentNode.childIds.splice(indexOfNodeToDelete, 1);

                draftDocment.selectedNodeId = parentNodeId;
            });

            applyNewDocToUndoStack(newDoc);
        },

        getBookmarkedNodeIds: ():number[] => getCurrentDoc().bookmarkedNodeIds,

        /**
         * Get whether the children of the specified node are visible
         *
         * @param nodeId The node in question
         * @returns Whether the children are visible
         */
        getChildrenVisible: (nodeId: number):boolean => safeGetNode(
            nodeId,
            'getChildrenVisible',
        ).childrenVisible,

        /**
         * Return the current doc as a JSON string
         *
         * @returns A string that can be used to recreate the current map
         */
        getCurrentDocAsJson: (): string => {
            const currentDoc = getCurrentDoc();

            // We need to create an equivalent array of the Nodes Map since
            // JSON can't encode Maps
            const nodeMapAsArray: Array<Node> = [];

            // We don't need to explicitly record the Map keys (which are node
            // IDs) because each Node also contains its ID
            currentDoc.nodes.forEach((nodeValue) => {
                nodeMapAsArray.push(nodeValue);
            });

            const jsonCapableMap = {
                ...currentDoc,
                nodes: nodeMapAsArray,
            };

            return JSON.stringify(jsonCapableMap);
        },

        /**
         * Return the name of the current document
         *
         * @returns The doc name
         */
        getDocName: ():string => state.docName,

        /**
         * Return a copy of the child IDs of the specified node.
         * Throw an exception if specified nodeId does not exist.
         *
         * @param nodeId The ID of the node whose children we want returned
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
         * Return whether the current document has unsaved changes
         *
         * @returns Whether doc has been modified
         */
        hasUnsavedChanges: ():boolean => state.hasUnsavedChanges,

        /**
         * Move the specified node down in its list of siblings
         *
         * @param nodeId The ID of the node to move
         */
        moveNodeDownInSiblingList: (nodeId: number) => {
            const thisNode = safeGetNode(nodeId, 'moveNodeUpInSiblingList');
            const { parentId } = thisNode;

            if (parentId === undefined) {
                return;
            }

            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                const parentNode = safeGetNode(
                    parentId,
                    'moveNodeUpInSiblingList',
                    draftDoc,
                );

                const allSiblings = parentNode.childIds;
                const thisNodeIndex = allSiblings.indexOf(nodeId);

                if (allSiblings.length !== 1) {
                    if (thisNodeIndex === allSiblings.length - 1) {
                        allSiblings.pop();
                        allSiblings.unshift(nodeId);
                    } else {
                        const lowerSiblingId = allSiblings[thisNodeIndex + 1];
                        allSiblings[thisNodeIndex + 1] = nodeId;
                        allSiblings[thisNodeIndex] = lowerSiblingId;
                    }
                }

                parentNode.childIds = allSiblings;
            });

            applyNewDocToUndoStack(newDoc);
        },
        /**
         * Move the specified node up in its list of siblings
         *
         * @param nodeId The ID of the node to move
         */
        moveNodeUpInSiblingList: (nodeId: number) => {
            const thisNode = safeGetNode(nodeId, 'moveNodeUpInSiblingList');
            const { parentId } = thisNode;

            if (parentId === undefined) {
                return;
            }

            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                const parentNode = safeGetNode(
                    parentId,
                    'moveNodeUpInSiblingList',
                    draftDoc,
                );

                const allSiblings = parentNode.childIds;
                const thisNodeIndex = allSiblings.indexOf(nodeId);

                if (allSiblings.length !== 1) {
                    if (thisNodeIndex === 0) {
                        allSiblings.shift();
                        allSiblings.push(nodeId);
                    } else {
                        const higherSiblingId = allSiblings[thisNodeIndex - 1];
                        allSiblings[thisNodeIndex - 1] = nodeId;
                        allSiblings[thisNodeIndex] = higherSiblingId;
                    }
                }

                parentNode.childIds = allSiblings;
            });

            applyNewDocToUndoStack(newDoc);
        },

        /**
         * Redo the last editor change (do nothing if no redo available)
         */
        redo: () => {
            if (redoAvailable()) {
                state.currentDocIndex += 1;
                state.hasUnsavedChanges = true;
            }
        },

        removeBookmark: (bookmarkToRemove: number) => {
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                /* eslint-disable no-param-reassign */
                draftDoc.bookmarkedNodeIds = draftDoc.bookmarkedNodeIds.filter(
                    (nodeId) => nodeId !== bookmarkToRemove,
                );
            });

            // Not sure having bookmarks participate in undo/redo is best
            // user experience, but having to manage stale bookmarked nodes
            // would be challenging
            applyNewDocToUndoStack(newDoc);
        },

        /**
         * Replace the currently loaded document with the specified one
         *
         * @param docName        The name to display for this document
         * @param jsonEncodedDoc A JSON string representing the map to use
         */
        replaceCurrentDocFromJson: (docName: string, jsonEncodedDoc: string) => {
            const docUsingArrayForNodes = JSON.parse(jsonEncodedDoc) as Doc;

            // jsonEncodedDoc uses an array to encode the `nodes`. So here we
            // convert back to a Map
            const nodesAsMap = new Map<number, Node>();
            docUsingArrayForNodes.nodes.forEach((node: Node) => {
                nodesAsMap.set(node.id, node);
            });

            const docUsingNodesAsMap = {
                ...docUsingArrayForNodes,
                nodes: nodesAsMap,
            };

            // To deal with importing a document that was creating prior to
            // adding bookmarkedNodeIds to the document structure
            if (docUsingArrayForNodes.bookmarkedNodeIds === undefined) {
                docUsingNodesAsMap.bookmarkedNodeIds = [];
            }

            state = {
                currentDocIndex: 0,
                docHistory: [docUsingNodesAsMap],
                docName,
                hasUnsavedChanges: false,
            };
        },

        /**
         * Replace the currently loaded document with an empty document
         */
        replaceCurrentDocWithNewEmptyDoc: () => {
            state = {
                currentDocIndex: 0,
                docHistory: [getInitialEmptyDoc()],
                docName: '',
                hasUnsavedChanges: true,
            };
        },

        /**
         * Replace the contents of the specified node
         *
         * @param nodeId      The ID of the node to operate on
         * @param newContents The contents to put into the specified node
         */
        replaceNodeContents: (nodeId: number, newContents: string) => {
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                const nodeToReplace = safeGetNode(nodeId, 'replaceNodeContents', draftDoc);
                nodeToReplace.contents = newContents;
            });

            applyNewDocToUndoStack(newDoc);
        },

        /**
         * Set the name of the current document
         *
         * @param docName The name to display for this document
         */
        setDocName: (docName: string) => {
            state.docName = docName;
        },

        /**
         * Set whether the current document has unsaved changes
         *
         * @param hasUnsavedChanges Whether the current doc has unsaved changes
         *                          or not
         */
        setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
            state.hasUnsavedChanges = hasUnsavedChanges;
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
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                draftDoc.selectedNodeId = nodeId;
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
            const newDoc = produce(getCurrentDoc(), (draftDoc) => {
                const node = safeGetNode(nodeId, 'toggleChildrenVisibility', draftDoc);
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
                state.hasUnsavedChanges = true;
            }
        },
    };
})();
