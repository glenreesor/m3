// Copyright 2022, 2023 Glen Reesor
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

import docState from './documentState';

function docIsInInitialState(): boolean {
    const rootNodeId = docState.getRootNodeId();
    const rootNodeContents = docState.getNodeContents(rootNodeId);
    const rootNodeChildren = docState.getNodeChildIds(rootNodeId);

    return (
        rootNodeContents === 'New Map' &&
        rootNodeChildren.length === 0
    );
}

beforeEach(docState.replaceCurrentDocWithNewEmptyDoc);

describe('initial state', () => {
    it('has a single root node with no children', () => {
        expect(docIsInInitialState()).toBe(true);
    });
});

describe('addBookmark and getBookmarks', () => {
    it('adds a bookmark when there are no existing bookmarks', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addBookmark(rootNodeId);

        const docBookmarks = docState.getBookmarkedNodeIds();
        expect(docBookmarks).toStrictEqual([rootNodeId]);
    });

    it('adds a bookmark when there are existing bookmarks', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'This is the child');

        const childId = docState.getNodeChildIds(rootNodeId)[0];

        docState.addBookmark(rootNodeId);
        docState.addBookmark(childId);

        const docBookmarks = docState.getBookmarkedNodeIds();
        expect(docBookmarks).toStrictEqual([rootNodeId, childId]);
    });
});

describe('addChild', () => {
    it('adds a child node when the parent has no children', () => {
        const newChildContentsSrc = 'new child';
        const rootNodeId = docState.getRootNodeId();
        const newChildId = docState.addChild(rootNodeId, newChildContentsSrc);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newChildContents = docState.getNodeContents(newChildId);

        expect(rootChildren).toStrictEqual([newChildId]);
        expect(newChildContents).toBe(newChildContentsSrc);
    });

    it('adds a child node when the parent already has a child', () => {
        const rootNodeId = docState.getRootNodeId();
        const existingChildId = docState.addChild(
            rootNodeId,
            'existing child',
        );

        const newChildContentsSrc = 'new child';
        const newChildId = docState.addChild(rootNodeId, newChildContentsSrc);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newChildContents = docState.getNodeContents(newChildId);

        expect(rootChildren).toStrictEqual([existingChildId, newChildId]);
        expect(newChildContents).toBe(newChildContentsSrc);
    });

    it('retains previous doc state on the undo stack', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'new child');
        docState.undo();

        expect(docIsInInitialState()).toBe(true);
    });
});

describe('addSibling', () => {
    it('will do nothing if trying to add sibling to root node', () => {
        const rootNodeId = docState.getRootNodeId();
        const newSiblingId = docState.addSibling(rootNodeId, 'new contents');

        expect(newSiblingId).toBe(-1);
        expect(docIsInInitialState()).toBe(true);
    });

    it('adds a sibling after a "last" child', () => {
        // Before:
        //  root -- existingSibling
        //
        // After:
        //  root -- existingSibling
        //       -- newSibling

        const newSiblingContentsSrc = 'new sibling';
        const rootNodeId = docState.getRootNodeId();
        const existingSiblingId = docState.addChild(rootNodeId, 'existing sibling');

        const newSiblingId = docState.addSibling(
            existingSiblingId,
            newSiblingContentsSrc,
        );

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newSiblingContents = docState.getNodeContents(newSiblingId);

        expect(rootChildren).toStrictEqual([existingSiblingId, newSiblingId]);
        expect(newSiblingContents).toBe(newSiblingContentsSrc);
    });

    it('adds a sibling between existing nodes', () => {
        // Before:
        //  root -- existingSibling1
        //       -- existingSibling2
        //
        // After:
        //  root -- existingSibling1
        //       -- newSibling
        //       -- existingSibling2

        const newSiblingContentsSrc = 'new sibling';
        const rootNodeId = docState.getRootNodeId();
        const existingSiblingId1 = docState.addChild(rootNodeId, 'existing sibling1');
        const existingSiblingId2 = docState.addChild(rootNodeId, 'existing sibling2');

        const newSiblingId = docState.addSibling(
            existingSiblingId1,
            newSiblingContentsSrc,
        );

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newSiblingContents = docState.getNodeContents(newSiblingId);

        expect(rootChildren).toStrictEqual([
            existingSiblingId1,
            newSiblingId,
            existingSiblingId2,
        ]);
        expect(newSiblingContents).toBe(newSiblingContentsSrc);
    });

    it('retains previous doc state on the undo stack', () => {
        const newSiblingContentsSrc = 'new sibling';
        const rootNodeId = docState.getRootNodeId();
        const existingSiblingId = docState.addChild(rootNodeId, 'existing sibling');

        docState.addSibling(
            existingSiblingId,
            newSiblingContentsSrc,
        );

        docState.undo();
        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren).toStrictEqual([existingSiblingId]);
    });
});

describe('deleteNode', () => {
    it('will do nothing if trying to delete the root node', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.deleteNode(rootNodeId);

        expect(docIsInInitialState()).toBe(true);
    });

    it('deletes the node when it is an only child', () => {
        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        docState.deleteNode(nodeToDeleteId);

        expect(docIsInInitialState()).toBe(true);
    });

    it('deletes the node when it is the first of multiple children', () => {
        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        const otherNodeId = docState.addChild(rootNodeId, 'another node');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren).toStrictEqual([otherNodeId]);
    });

    it('deletes the node when it is a middle child', () => {
        const rootNodeId = docState.getRootNodeId();
        const otherNodeId1 = docState.addChild(rootNodeId, 'another node1');
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        const otherNodeId2 = docState.addChild(rootNodeId, 'another node2');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren).toStrictEqual([otherNodeId1, otherNodeId2]);
    });

    it('deletes the node when it is the last of multiple children', () => {
        const rootNodeId = docState.getRootNodeId();
        const otherNodeId1 = docState.addChild(rootNodeId, 'another node1');
        const otherNodeId2 = docState.addChild(rootNodeId, 'another node2');
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren).toStrictEqual([otherNodeId1, otherNodeId2]);
    });

    it('retains previous doc state on the undo stack', () => {
        const nodeToDeleteContentsSrc = 'node to delete';

        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(
            rootNodeId,
            nodeToDeleteContentsSrc,
        );
        docState.deleteNode(nodeToDeleteId);
        docState.undo();

        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren).toStrictEqual([nodeToDeleteId]);
        expect(
            docState.getNodeContents(nodeToDeleteId),
        ).toBe(nodeToDeleteContentsSrc);
    });

    it('removes the corresponding bookmark when deleted node is bookmarked', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'This is the child');

        const childId = docState.getNodeChildIds(rootNodeId)[0];

        docState.addBookmark(rootNodeId);
        docState.addBookmark(childId);

        docState.deleteNode(childId);

        const docBookmarks = docState.getBookmarkedNodeIds();
        expect(docBookmarks).toStrictEqual([rootNodeId]);
    });
});

describe('getChildrenVisible', () => {
    it('returns true when there are no children', () => {
        const rootNodeId = docState.getRootNodeId();
        expect(docState.getChildrenVisible(rootNodeId)).toBe(true);
    });

    it('returns true when visibility has not been toggled', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child node');

        expect(docState.getChildrenVisible(rootNodeId)).toBe(true);
    });

    it('returns false when visibility has been toggled', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child node');
        docState.toggleChildrenVisibility(rootNodeId);

        expect(docState.getChildrenVisible(rootNodeId)).toBe(false);
    });
});

describe('getChildrenVisible / toggleChildrenVisibility', () => {
    it('works together', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');

        expect(docState.getChildrenVisible(rootNodeId)).toBe(true);

        docState.toggleChildrenVisibility(rootNodeId);
        expect(docState.getChildrenVisible(rootNodeId)).toBe(false);

        docState.toggleChildrenVisibility(rootNodeId);
        expect(docState.getChildrenVisible(rootNodeId)).toBe(true);
    });
});

describe('getCurrentDocAsJson', () => {
    it('returns appropriate json for a single node', () => {
        // Note we're creating the expected map using an array of nodes
        // rather than a map, as that's what the tested function does
        const expectedMap = {
            rootId: 0,
            highestNodeId: 0,
            selectedNodeId: 0,

            bookmarkedNodeIds: [],
            nodes: [{
                id: 0,
                contents: 'New Map',
                childIds: [],
                childrenVisible: true,
                parentId: undefined,
            }],
        };
        const expectedJson = JSON.stringify(expectedMap);

        const json = docState.getCurrentDocAsJson();
        expect(json).toBe(expectedJson);
    });

    it('returns appropriate json when there are children', () => {
        const childContentsSrc1 = 'child1';
        const childContentsSrc2 = 'child2';

        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, childContentsSrc1);
        docState.addChild(rootNodeId, childContentsSrc2);

        // Note we're creating the expected map using an array of nodes
        // rather than a map, as that's what the tested function does
        const expectedMap = {
            rootId: 0,
            highestNodeId: 2,
            selectedNodeId: 0,

            bookmarkedNodeIds: [],
            nodes: [
                {
                    id: 0,
                    contents: 'New Map',
                    childIds: [1, 2],
                    childrenVisible: true,
                    parentId: undefined,
                },
                {
                    id: 1,
                    contents: childContentsSrc1,
                    childIds: [],
                    childrenVisible: true,
                    parentId: 0,
                },
                {
                    id: 2,
                    contents: childContentsSrc2,
                    childIds: [],
                    childrenVisible: true,
                    parentId: 0,
                },
            ],
        };
        const expectedJson = JSON.stringify(expectedMap);

        const json = docState.getCurrentDocAsJson();
        expect(json).toBe(expectedJson);
    });

    it('includes the currently selected nodeId', () => {
        const childContentsSrc = 'child';

        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, childContentsSrc);

        // Note we're creating the expected map using an array of nodes
        // rather than a map, as that's what the tested function does
        const expectedMap = {
            rootId: 0,
            highestNodeId: 1,
            selectedNodeId: 1,

            bookmarkedNodeIds: [],
            nodes: [
                {
                    id: 0,
                    contents: 'New Map',
                    childIds: [1],
                    childrenVisible: true,
                    parentId: undefined,
                },
                {
                    id: 1,
                    contents: childContentsSrc,
                    childIds: [],
                    childrenVisible: true,
                    parentId: 0,
                },
            ],
        };
        docState.setSelectedNodeId(1);

        const expectedJson = JSON.stringify(expectedMap);
        const json = docState.getCurrentDocAsJson();
        expect(json).toBe(expectedJson);
    });
});

describe('getCurrentDocAsJson / replaceCurrentDocFromJson', () => {
    it('replaceCurrentDocFromJson can read the output from getCurrentDocAsJson', () => {
        const rootNodeId = docState.getRootNodeId();
        const childId1 = docState.addChild(rootNodeId, 'child1');
        docState.addChild(rootNodeId, 'child2');
        docState.replaceNodeContents(childId1, 'new child1');
        docState.replaceNodeContents(childId1, 'new new child1');
        docState.addChild(childId1, 'grand child');

        // Other tests confirm the actual result of getCurrentDocAsJson()
        // and the state after replaceCurrentDocFromJson(), so just
        // do minimal checks when using these together

        const docAsJson = docState.getCurrentDocAsJson();
        docState.replaceCurrentDocFromJson('new title', docAsJson);

        const newRootNodeId = docState.getRootNodeId();
        const newRootChildren = docState.getNodeChildIds(newRootNodeId);

        expect(newRootNodeId).toBe(0);
        expect(newRootChildren).toStrictEqual([1, 2]);
    });
});

describe('getDocLastExportedTimestamp', () => {
    it('returns undefined for a newly created document', () => {
        expect(docState.getDocLastExportedTimestamp()).toBe(undefined);
    });
});

describe('getDocName / setDocName', () => {
    it('returns the name that was set for this document', () => {
        const docName = 'the doc name';
        docState.setDocName(docName);
        expect(docState.getDocName()).toBe(docName);
    });
});

describe('getNodeChildIds', () => {
    it('returns an empty list when there are no children', () => {
        const rootNodeId = docState.getRootNodeId();
        const children = docState.getNodeChildIds(rootNodeId);

        expect(children.length).toEqual(0);
    });

    it('returns the list of child IDs when there are children', () => {
        const rootNodeId = docState.getRootNodeId();
        const childId = docState.addChild(rootNodeId, 'child');
        const children = docState.getNodeChildIds(rootNodeId);

        expect(children).toStrictEqual([childId]);
    });
});

describe('getNodeContents', () => {
    it('returns the node contents', () => {
        const rootNodeId = docState.getRootNodeId();
        const contents = docState.getNodeContents(rootNodeId);

        expect(contents).toBe('New Map');
    });
});

describe('getRedoIsAvailable', () => {
    it('returns false for a newly created document', () => {
        expect(docState.getRedoIsAvailable()).toBe(false);
    });

    it('returns false when the no undos have been applied', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');

        expect(docState.getRedoIsAvailable()).toBe(false);
    });

    it('returns true when an undo step has been applied', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');
        docState.undo();

        expect(docState.getRedoIsAvailable()).toBe(true);
    });

    it('returns false when the last redo is applied', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');
        docState.undo();
        docState.redo();

        expect(docState.getRedoIsAvailable()).toBe(false);
    });
});

describe('getRootNodeId', () => {
    it('returns the root node ID', () => {
        expect(docState.getRootNodeId()).toBe(0);
    });
});

describe('getSelectedNodeId / setSelectedNodeId', () => {
    it('gets/sets nodes', () => {
        const rootNodeId = docState.getRootNodeId();
        const childId = docState.addChild(rootNodeId, 'child');

        expect(docState.getSelectedNodeId()).toBe(rootNodeId);

        docState.setSelectedNodeId(childId);
        expect(docState.getSelectedNodeId()).toBe(childId);
    });
});

describe('getUndoIsAvailable', () => {
    it('returns false for a newly created document', () => {
        expect(docState.getUndoIsAvailable()).toBe(false);
    });

    it('returns true when the map has been edited', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');

        expect(docState.getUndoIsAvailable()).toBe(true);
    });

    it('returns false when the last undo is applied', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child');
        docState.undo();

        expect(docState.getUndoIsAvailable()).toBe(false);
    });
});

describe('hasUnsavedChanges / setHasUnsavedChanges', () => {
    it('returns true for a newly created document', () => {
        expect(docState.hasUnsavedChanges()).toBe(true);
    });

    it('returns false when the associated setter is called', () => {
        docState.setHasUnsavedChanges(false);
        expect(docState.hasUnsavedChanges()).toBe(false);
    });
});

describe('moveNodeDownInSiblingList', () => {
    it('does nothing when applied to the root node', () => {
        const initialSerializedDoc = docState.getCurrentDocAsJson();

        const rootNodeId = docState.getRootNodeId();
        docState.moveNodeDownInSiblingList(rootNodeId);

        expect(docState.getCurrentDocAsJson()).toBe(initialSerializedDoc);
    });

    it('does nothing when applied to an only child', () => {
        const childContentsSrc = 'child';

        const rootNodeId = docState.getRootNodeId();
        const childId = docState.addChild(rootNodeId, childContentsSrc);

        const initialSerializedDoc = docState.getCurrentDocAsJson();
        docState.moveNodeDownInSiblingList(childId);

        expect(docState.getCurrentDocAsJson()).toBe(initialSerializedDoc);
    });

    it('moves a child down in the sibling list', () => {
        const childContentsSrc1 = 'child1';
        const childContentsSrc2 = 'child2';
        const childContentsSrc3 = 'child3';

        const rootNodeId = docState.getRootNodeId();
        const childId1 = docState.addChild(rootNodeId, childContentsSrc1);
        const childId2 = docState.addChild(rootNodeId, childContentsSrc2);
        const childId3 = docState.addChild(rootNodeId, childContentsSrc3);

        docState.moveNodeDownInSiblingList(childId1);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren).toStrictEqual([childId2, childId1, childId3]);
    });

    it('moving the last child moves it to first in the list', () => {
        const childContentsSrc1 = 'child1';
        const childContentsSrc2 = 'child2';
        const childContentsSrc3 = 'child3';

        const rootNodeId = docState.getRootNodeId();
        const childId1 = docState.addChild(rootNodeId, childContentsSrc1);
        const childId2 = docState.addChild(rootNodeId, childContentsSrc2);
        const childId3 = docState.addChild(rootNodeId, childContentsSrc3);

        docState.moveNodeDownInSiblingList(childId3);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren).toStrictEqual([childId3, childId1, childId2]);
    });
});

describe('moveNodeUpInSiblingList', () => {
    it('does nothing when applied to the root node', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.moveNodeUpInSiblingList(rootNodeId);

        expect(docIsInInitialState()).toBe(true);
    });

    it('does nothing when applied to an only child', () => {
        const childContentsSrc = 'child';

        const rootNodeId = docState.getRootNodeId();
        const childId = docState.addChild(rootNodeId, childContentsSrc);

        const initialSerializedDoc = docState.getCurrentDocAsJson();
        docState.moveNodeUpInSiblingList(childId);

        expect(docState.getCurrentDocAsJson()).toBe(initialSerializedDoc);
    });

    it('moves a child up in the sibling list', () => {
        const childContentsSrc1 = 'child1';
        const childContentsSrc2 = 'child2';
        const childContentsSrc3 = 'child3';

        const rootNodeId = docState.getRootNodeId();
        const childId1 = docState.addChild(rootNodeId, childContentsSrc1);
        const childId2 = docState.addChild(rootNodeId, childContentsSrc2);
        const childId3 = docState.addChild(rootNodeId, childContentsSrc3);

        docState.moveNodeUpInSiblingList(childId3);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren).toStrictEqual([childId1, childId3, childId2]);
    });

    it('moving the first child moves it to last in the list', () => {
        const childContentsSrc1 = 'child1';
        const childContentsSrc2 = 'child2';
        const childContentsSrc3 = 'child3';

        const rootNodeId = docState.getRootNodeId();
        const childId1 = docState.addChild(rootNodeId, childContentsSrc1);
        const childId2 = docState.addChild(rootNodeId, childContentsSrc2);
        const childId3 = docState.addChild(rootNodeId, childContentsSrc3);

        docState.moveNodeUpInSiblingList(childId1);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren).toStrictEqual([childId2, childId3, childId1]);
    });
});

describe('redo / undo / getRedoIsAvailable / getUndoIsAvailable', () => {
    // Undo have been tested for individual operations like
    // addChild etc, so these tests will just be sanity tests for a
    // sequence of changes

    it('handles multiple undo / redo steps properly', () => {
        const serializedMapsBeforeChange = [];
        const serializedMapsAfterChange = [];

        const rootNodeId = docState.getRootNodeId();

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        const childId1 = docState.addChild(rootNodeId, 'child1');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        docState.addChild(rootNodeId, 'child2');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        docState.replaceNodeContents(childId1, 'new child1');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        docState.replaceNodeContents(childId1, 'new new child1');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        const childId1a = docState.addSibling(childId1, 'child1a');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        serializedMapsBeforeChange.push(docState.getCurrentDocAsJson());
        docState.addChild(childId1a, 'grand child');
        serializedMapsAfterChange.push(docState.getCurrentDocAsJson());

        expect(docState.getRedoIsAvailable()).toBe(false);
        expect(docState.getUndoIsAvailable()).toBe(true);

        const reversedMapsBeforeChange = [...serializedMapsBeforeChange].reverse();
        reversedMapsBeforeChange.forEach((serializedMap, index) => {
            const expectedUndoIsAvailable = (index !== serializedMapsBeforeChange.length - 1);

            docState.undo();

            expect(docState.getCurrentDocAsJson()).toStrictEqual(serializedMap);
            expect(docState.getRedoIsAvailable()).toBe(true);
            expect(docState.getUndoIsAvailable()).toBe(expectedUndoIsAvailable);
        });

        serializedMapsAfterChange.forEach((serializedMap, index) => {
            const expectedRedoIsAvailable = (index !== serializedMapsBeforeChange.length - 1);

            docState.redo();

            expect(docState.getCurrentDocAsJson()).toStrictEqual(serializedMap);
            expect(docState.getUndoIsAvailable()).toBe(true);
            expect(docState.getRedoIsAvailable()).toBe(expectedRedoIsAvailable);
        });
    });
});

describe('removeBookmark and getBookmarks', () => {
    it('removes the specified bookmark when it is the only bookmark', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addBookmark(rootNodeId);

        docState.removeBookmark(rootNodeId);

        const bookmarks = docState.getBookmarkedNodeIds();
        expect(bookmarks).toHaveLength(0);
    });

    it('removes the specified bookmark when there are other bookmarks', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'This is the child');

        const childId = docState.getNodeChildIds(rootNodeId)[0];

        docState.addBookmark(rootNodeId);
        docState.addBookmark(childId);

        docState.removeBookmark(childId);
        const docBookmarks = docState.getBookmarkedNodeIds();
        expect(docBookmarks).toStrictEqual([rootNodeId]);
    });
});

describe('replaceCurrentDocFromJson', () => {
    it('loads a document', () => {
        const newDocName = 'New Doc Name';
        const jsonToLoad = JSON.stringify({
            rootId: 0,
            nodes: [
                {
                    id: 0,
                    contents: 'root node',
                    childIds: [1],
                    childrenVisible: true,
                    parentId: undefined,
                },
                {
                    id: 1,
                    contents: 'child',
                    childIds: [],
                    childrenVisible: true,
                    parentId: 0,
                },
            ],
        });
        docState.replaceCurrentDocFromJson(newDocName, jsonToLoad);

        // We don't just compare a serialized form because we want to make
        // sure that the parsing / loading created a valid structure.
        const rootNodeId = docState.getRootNodeId();
        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const rootContents = docState.getNodeContents(rootNodeId);

        const childId = rootChildren[0];
        const childContents = docState.getNodeContents(childId);
        const childChildren = docState.getNodeChildIds(childId);

        expect(docState.getDocName()).toBe(newDocName);

        expect(rootNodeId).toBe(0);
        expect(rootChildren).toStrictEqual([1]);
        expect(rootContents).toEqual('root node');

        expect(childId).toBe(1);
        expect(childContents).toBe('child');
        expect(childChildren).toStrictEqual([]);
    });
});

describe('replaceCurrentDocWithNewEmptyDoc', () => {
    it('replaces the document contents', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child1');
        docState.addChild(rootNodeId, 'child2');

        docState.replaceCurrentDocWithNewEmptyDoc();
        expect(docIsInInitialState()).toBe(true);
    });
});

describe('replaceNodeContents', () => {
    it('replaces the node contents', () => {
        const newContents = 'hello world';

        const rootNodeId = docState.getRootNodeId();
        docState.replaceNodeContents(rootNodeId, newContents);

        expect(docState.getNodeContents(rootNodeId)).toBe(newContents);
    });
});

describe('setDocLastExportedTimestamp', () => {
    it('updates the value and sets hasUnsavedChanges to true', () => {
        const testTimestamp = Date.now();
        docState.setDocLastExportedTimestamp(testTimestamp);

        expect(docState.getDocLastExportedTimestamp()).toBe(testTimestamp);
        expect(docState.hasUnsavedChanges()).toBe(true);
    });
});
