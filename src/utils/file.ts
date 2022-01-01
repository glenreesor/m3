import state from '../state/state';

export const FILE_EXISTS = 1;
export const FILE_NOT_FOUND = 2;
export const FILE_OPERATION_SUCCESSFUL = 3;

const DOCUMENT_LIST_KEY = 'm3DocumentList';

// This module implements a simple document storage system using the browser's
// localStorage.
//
// LocalStorage key, value pairs:
//  - DOCUMENT_LIST_KEY, <Array of document names>
//  - `m3Document-N`, JSON string of document in Nth position of
//    DOCUMENT_LIST_KEY
//
// Example:
//  DOCUMENT_LIST_KEY: ['doc1', 'doc2', 'doc3']
//  `m3Document-0`: [JSON representation of 'doc1']
//  `m3Document-1`: [JSON representation of 'doc2']
//  `m3Document-2`: [JSON representation of 'doc3']

/**
 * Delete the document of the specified name
 *
 * @param documentName The name of the document to delete
 *
 * @returns The status of the delete operation
 */
export function deleteDocument(documentName: string): number {
    const documentList = getSavedDocumentList();
    const documentIndex = documentList.indexOf(documentName);

    if (documentIndex === -1) {
        return FILE_NOT_FOUND;
    }

    const newDocumentList = documentList.filter(
        (_name, index) => index !== documentIndex,
    );
    const documentKey = getSavedDocumentKey(documentIndex);

    window.localStorage.setItem(DOCUMENT_LIST_KEY, JSON.stringify(newDocumentList));
    window.localStorage.removeItem(documentKey);

    return FILE_OPERATION_SUCCESSFUL;
}

/**
 * Return a list of documents currently saved in localStorage
 *
 * @returns An array of names of the saved documents
 */
export function getSavedDocumentList(): string[] {
    const documentListJson = window.localStorage.getItem(DOCUMENT_LIST_KEY);
    const documentList = JSON.parse(documentListJson || '[]');

    return documentList;
}

/**
 * Get a document saved in localStorage
 *
 * @param name The name of the document to be retrieved
 *
 * @returns The document or an error code
 */
export function getSavedDocument(name: string): string | number {
    const documentList = getSavedDocumentList();
    const documentIndex = documentList.indexOf(name);

    if (documentIndex === -1) {
        return FILE_NOT_FOUND;
    }

    const documentKey = getSavedDocumentKey(documentIndex);
    const doc = window.localStorage.getItem(documentKey) || '';

    return doc;
}

/**
 * Get a document name that is guaranteed to be unique among the currently saved
 * docs
 *
 * @param baseName The base of the new filename (characters will be appended
 *                 to this string as required in order to create a unique name)
 *
 * @returns The unique filename
 */
export function getUniqueFilename(baseName: string): string {
    const existingSavedDocs = getSavedDocumentList();
    let newDocName = baseName;

    while (existingSavedDocs.includes(newDocName)) {
        newDocName += '-1';
    }

    return newDocName;
}

/**
 * Rename the specified file
 *
 * @param currentName The current name of a saved document
 * @param newName The new name
 *
 * @returns Status of the rename operations
 */
export function renameDocument(currentName: string, newName: string): number {
    const documentList = getSavedDocumentList();
    const documentIndex = documentList.indexOf(currentName);

    if (documentIndex === -1) {
        return FILE_NOT_FOUND;
    }

    documentList[documentIndex] = newName;

    const documentListJson = JSON.stringify(documentList);
    window.localStorage.setItem(DOCUMENT_LIST_KEY, documentListJson);

    return FILE_OPERATION_SUCCESSFUL;
}

/**
 * Save a document in localStorage
 *
 * @param replaceExisting Whether replacing an existing document of the same
 *                        name is permitted
 * @param docName         The name to be used for the document
 * @param doc             The contents of the document
 *
 * @returns Status of the save operation.
 */
export function saveDocument(
    replaceExisting: boolean,
    docName: string,
    doc: string,
): number {
    const documentList = getSavedDocumentList();
    const currentDocIndex = documentList.indexOf(docName);
    let indexForSaveOp;

    if (currentDocIndex !== -1) {
        if (!replaceExisting) {
            return FILE_EXISTS;
        }

        indexForSaveOp = currentDocIndex;
    } else {
        // Add this document to the current document list
        documentList.push(docName);
        const documentListJson = JSON.stringify(documentList);
        window.localStorage.setItem(DOCUMENT_LIST_KEY, documentListJson);
        indexForSaveOp = documentList.length - 1;
    }

    // Save the document itself
    saveDocumentAtIndex(indexForSaveOp, doc);
    return FILE_OPERATION_SUCCESSFUL;
}

//------------------------------------------------------------------------------

function getSavedDocumentKey(index: number) {
    return `m3Document-${index}`;
}

function saveDocumentAtIndex(docIndex: number, doc: string) {
    window.localStorage.setItem(getSavedDocumentKey(docIndex), doc);
    state.doc.setHasUnsavedChanges(false);
}
