const DOCUMENT_LIST_KEY = 'm3DocumentList';

/**
 * Return a list of documents currently saved in localStorage
 *
 * @returns An array where the indices can be used for other functions in
 *          this file, and the values are the names of the saved documents
 */
export function getSavedDocumentList(): string[] {
    const documentListJson = window.localStorage.getItem(DOCUMENT_LIST_KEY);
    const documentList = JSON.parse(documentListJson || '[]');

    return documentList;
}

/**
 * Get a document saved in localStorage
 *
 * @param index The index for the document, as returned by getSavedDocumentList()
 *
 * @returns The document
 */
export function getSavedDocument(index: number): string {
    const documentKey = getSavedDocumentKey(index);
    const document = window.localStorage.getItem(documentKey) || '';

    return document;
}

/**
 * Save a new document in localStorage
 *
 * @param documentName The name to be used for the document
 * @param document     The contents of the document
 */
export function saveNewDocument(documentName: string, document: string) {
    const documentList = getSavedDocumentList();
    documentList.push(documentName);

    const documentListJson = JSON.stringify(documentList);

    window.localStorage.setItem(DOCUMENT_LIST_KEY, documentListJson);

    const newDocumentIndex = documentList.length - 1;
    window.localStorage.setItem(getSavedDocumentKey(newDocumentIndex), document);
}

/**
 * Replace a saved document with new contents
 *
 * @param index    The index (as returned by getSavedDocumentList() of the document
 *                 to replace
 * @param document The new document to replace the old one
 */
export function replaceDocument(index: number, document: string) {
    const currentDocumentList = getSavedDocumentList();

    if (index < 0 || index >= currentDocumentList.length) {
        throw new Error(
            `Invalid index provided to replaceDocument: ${index}`,
        );
    } else {
        window.localStorage.setItem(getSavedDocumentKey(index), document);
    }
}

function getSavedDocumentKey(index: number) {
    return `m3Document-${index}`;
}
