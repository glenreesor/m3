import importFreeplane from './importFreeplane';

/**
 * Import the specified content as the current document (replacing whatever the
 * currently loaded m3 document is)
 *
 * @param fileContents The document to be imported -- can be either Freeplane
 *                     or m3.
 */
export default function importFile(fileContents: string) {
    if (fileContents.startsWith('<map version')) {
        importFreeplane(fileContents);
    } else {
        console.log('Unable to determine file import type.');
    }
}
