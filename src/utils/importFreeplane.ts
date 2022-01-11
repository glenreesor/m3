// Copyright 2022 Glen Reesor
//
// This file is part of m3 Mobile Mind Mapper.
//
// m3 Mobile Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// m3 Mobile Mind Mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// m3 Mobile Mind Mapper. If not, see <https://www.gnu.org/licenses/>.

import state from '../state/state';
import { getUniqueFilename } from './file';

/**
 * Import the specified content as the current document (replacing whatever the
 * currently loaded m3 document is)
 *
 * @param freeplaneDocContents The Freeplane document to be imported
 */
export default function importFreeplane(freeplaneDocContents: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(freeplaneDocContents, 'application/xml');

    if (doc.querySelector('parsererror')) {
        console.log('error while parsing');
    } else {
        processImportedFreeplaneDoc(doc);
    }
}

//------------------------------------------------------------------------------

function getFreeplaneChildNodes(parentNode: Element): Element[] {
    const childDisplayNodes = [];

    for (let i = 0; i < parentNode.children.length; i += 1) {
        // We have to check the nodeName because we're parsing an XML document
        // created by the browser, which includes a pile of other child types
        const childXmlNode = parentNode.children.item(i);
        if (childXmlNode && childXmlNode.nodeName === 'node') {
            childDisplayNodes.push(childXmlNode);
        }
    }

    return childDisplayNodes;
}

function getFreeplaneTextContent(freeplaneNode: Element): string {
    return freeplaneNode.attributes.getNamedItem('TEXT')?.value || '';
}

function processImportedFreeplaneDoc(xmlDoc: Document) {
    // The root XML element is '<map>'. Double check that it's there
    const importMapElement = xmlDoc.documentElement;

    if (importMapElement.nodeName !== 'map') {
        console.log('Doesn\'t look like a Freeplane map');
        return;
    }

    state.doc.replaceCurrentDocWithNewEmptyDoc();
    state.doc.setDocName(getUniqueFilename('Imported Freeplane Document'));

    // We're assuming Freeplane can only have one root node here.
    // Hope that's right
    const freeplaneRootNode = getFreeplaneChildNodes(importMapElement)[0];
    const m3RootId = state.doc.getRootNodeId();

    state.doc.replaceNodeContents(
        m3RootId,
        getFreeplaneTextContent(freeplaneRootNode),
    );

    getFreeplaneChildNodes(freeplaneRootNode).forEach((child) => {
        addFreeplaneNodeToCurrentM3Doc(child, m3RootId);
    });

    state.doc.toggleChildrenVisibility(m3RootId);
}

function addFreeplaneNodeToCurrentM3Doc(
    freeplaneNode: Element,
    parentNodeId: number,
) {
    const thisNodeId = state.doc.addChild(
        parentNodeId,
        getFreeplaneTextContent(freeplaneNode),
    );
    const childNodes = getFreeplaneChildNodes(freeplaneNode);

    childNodes.forEach((child) => {
        addFreeplaneNodeToCurrentM3Doc(child, thisNodeId);
    });

    state.doc.toggleChildrenVisibility(thisNodeId);
}
