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

import docState from "./documentState";

beforeEach(docState.replaceCurrentDocWithNewEmptyDoc);

describe('initial state', () => {
    it('has a single root node with no children', () => {
        const rootNodeId = docState.getRootNodeId();
        const contents = docState.getNodeContents(rootNodeId);
        const children = docState.getNodeChildIds(rootNodeId);

        expect(contents).toEqual('New Map');
        expect(children.length).toEqual(0);
    });
});

describe('addChild', () => {
    it('adds a child node when the parent has no children', () => {
        const newChildContentsSrc = 'new child';
        const rootNodeId = docState.getRootNodeId();
        const newChildId = docState.addChild(rootNodeId, newChildContentsSrc);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newChildContents = docState.getNodeContents(newChildId);

        expect(rootChildren.length).toBe(1);
        expect(rootChildren[0]).toBe(newChildId);
        expect(newChildContents).toBe(newChildContentsSrc);
    });

    it('adds a child node when the parent already has a child', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'existing child');

        const newChildContentsSrc = 'new child';
        const newChildId = docState.addChild(rootNodeId, newChildContentsSrc);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newChildContents = docState.getNodeContents(newChildId);

        expect(rootChildren.length).toBe(2);
        expect(rootChildren[1]).toBe(newChildId);
        expect(newChildContents).toBe(newChildContentsSrc);
    });

    it('retains previous doc state on the undo stack', () => {

        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'new child');

        docState.undo();
        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(0);
    });
});

describe('addSibling', () => {
    it('will do nothing if trying to add sibling to root node', () => {
        const rootNodeId = docState.getRootNodeId();
        const newSiblingId = docState.addSibling(rootNodeId, 'new contents');

        expect(newSiblingId).toBe(-1);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(0);
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
            newSiblingContentsSrc
        );

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newSiblingContents = docState.getNodeContents(newSiblingId);

        expect(rootChildren.length).toBe(2);
        expect(rootChildren[0]).toBe(existingSiblingId);
        expect(rootChildren[1]).toBe(newSiblingId);
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
            newSiblingContentsSrc
        );

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        const newSiblingContents = docState.getNodeContents(newSiblingId);

        expect(rootChildren.length).toBe(3);
        expect(rootChildren[0]).toBe(existingSiblingId1);
        expect(rootChildren[1]).toBe(newSiblingId);
        expect(rootChildren[2]).toBe(existingSiblingId2);
        expect(newSiblingContents).toBe(newSiblingContentsSrc);
    });

    it('retains previous doc state on the undo stack', () => {
        const newSiblingContentsSrc = 'new sibling';
        const rootNodeId = docState.getRootNodeId();
        const existingSiblingId = docState.addChild(rootNodeId, 'existing sibling');

        docState.addSibling(
            existingSiblingId,
            newSiblingContentsSrc
        );

        docState.undo();
        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(1);
        expect(rootChildren[0]).toBe(existingSiblingId);
    });
});

describe('deleteNode', () => {
    it('will do nothing if trying to delete the root node', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.deleteNode(rootNodeId);

        expect(docState.getNodeContents(rootNodeId)).toBe('New Map');
    });

    it('deletes the node when it is an only child', () => {
        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(0);
    });

    it('deletes the node when it is the first of multiple children', () => {
        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        const otherNodeId = docState.addChild(rootNodeId, 'another node');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(1);
        expect(rootChildren[0]).toBe(otherNodeId);
    });

    it('deletes the node when it is a middle child', () => {
        const rootNodeId = docState.getRootNodeId();
        const otherNodeId1 = docState.addChild(rootNodeId, 'another node1');
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');
        const otherNodeId2 = docState.addChild(rootNodeId, 'another node2');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(2);
        expect(rootChildren[0]).toBe(otherNodeId1);
        expect(rootChildren[1]).toBe(otherNodeId2);
    });

    it('deletes the node when it is the last of multiple children', () => {
        const rootNodeId = docState.getRootNodeId();
        const otherNodeId1 = docState.addChild(rootNodeId, 'another node1');
        const otherNodeId2 = docState.addChild(rootNodeId, 'another node2');
        const nodeToDeleteId = docState.addChild(rootNodeId, 'node to delete');

        docState.deleteNode(nodeToDeleteId);

        const rootChildren = docState.getNodeChildIds(rootNodeId);
        expect(rootChildren.length).toBe(2);
        expect(rootChildren[0]).toBe(otherNodeId1);
        expect(rootChildren[1]).toBe(otherNodeId2);
    });

    it('retains previous doc state on the undo stack', () => {
        const nodeToDeleteContentsSrc = 'node to delete';

        const rootNodeId = docState.getRootNodeId();
        const nodeToDeleteId = docState.addChild(
            rootNodeId,
            nodeToDeleteContentsSrc
        );
        docState.deleteNode(nodeToDeleteId);
        docState.undo();

        const rootChildren = docState.getNodeChildIds(rootNodeId);

        expect(rootChildren.length).toBe(1);
        expect(rootChildren[0]).toBe(nodeToDeleteId);
        expect(
            docState.getNodeContents(nodeToDeleteId)
        ).toBe(nodeToDeleteContentsSrc);
    });
});

describe('getChildrenVisible', () => {
    it('returns true when there are no children', () => {
        const rootNodeId = docState.getRootNodeId();
        expect(docState.getChildrenVisible(rootNodeId));
    });

    it('returns true when visibility has not been toggled', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child node');

        expect(docState.getChildrenVisible(rootNodeId));
    });

    it('returns false when visibility has been toggled', () => {
        const rootNodeId = docState.getRootNodeId();
        docState.addChild(rootNodeId, 'child node');
        docState.toggleChildrenVisibility(rootNodeId);

        expect(!docState.getChildrenVisible(rootNodeId));
    });
});

describe('getCurrentDocAsJson', () => {
    it('returns appropriate json for a single node', () => {
        // Note we're creating the expected map using an array of nodes
        // rather than a map, as that's what the tested function does
        const expectedMap = {
            selectedNodeId: 0,
            nodes: [{
                id: 0,
                contents: 'New Map',
                childIds: [],
                childrenVisible: true,
                parentId: undefined,
            }],
            highestNodeId: 0,
            rootId: 0,
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
            selectedNodeId: 0,
            nodes: [
                {
                    id: 0,
                    contents: 'New Map',
                    childIds: [1,2],
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
            highestNodeId: 2,
            rootId: 0,
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
            selectedNodeId: 1,
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
            highestNodeId: 1,
            rootId: 0,
        };
        docState.setSelectedNodeId(1);

        const expectedJson = JSON.stringify(expectedMap);
        const json = docState.getCurrentDocAsJson();
        expect(json).toBe(expectedJson);
    });
});

describe('getDocName', () => {
    it('returns the name that was set for this document', () => {
        const docName = 'the doc name';
        docState.setDocName(docName);
        expect(docState.getDocName()).toBe(docName);
    });
});
