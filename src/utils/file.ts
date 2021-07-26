export const FILE_EXISTS = 1;
export const FILE_NOT_FOUND = 2;
export const FILE_SAVE_SUCCESSFUL = 3;

const DOCUMENT_LIST_KEY = 'm3DocumentList';

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
 * Save a document in localStorage. Prompt the user for a name if `docName`
 * is ''.
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

    if (currentDocIndex !== -1) {
        if (!replaceExisting) {
            return FILE_EXISTS;
        }
        window.localStorage.setItem(getSavedDocumentKey(currentDocIndex), doc);
        return FILE_SAVE_SUCCESSFUL;
    }

    // Add this document to the current document list
    documentList.push(docName);

    const documentListJson = JSON.stringify(documentList);

    window.localStorage.setItem(DOCUMENT_LIST_KEY, documentListJson);

    // Save the document itself
    const newDocumentIndex = documentList.length - 1;
    window.localStorage.setItem(getSavedDocumentKey(newDocumentIndex), doc);

    return FILE_SAVE_SUCCESSFUL;
}

function getSavedDocumentKey(index: number) {
    return `m3Document-${index}`;
}
