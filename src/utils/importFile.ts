import state from '../state/state';
import importFreeplane from './importFreeplane';
import { getUniqueFilename } from './file';

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
    } else if (fileContents.startsWith('{')) {
        state.doc.replaceCurrentDocFromJson(
            getUniqueFilename('Imported m3 Document'),
            fileContents,
        );
    } else {
        console.log('Unable to determine file type');
    }
}
