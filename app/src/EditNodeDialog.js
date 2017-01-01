"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License, version 3, as
// published by the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with m3 - Mobile Mind Mapper.  If not, see
// <http://www.gnu.org/licenses/>.

import {m3App} from './main';
import {App} from './App';
import {Sizer} from './Sizer';
import {State} from './State';

const MAX_HEIGHT = 80;     // Max height (pixels) of text entry field
const MAX_ROWS = 5;

/**
 * A EditNodeDialog object will handle displaying a dialog to edit node text
 * (just node text--not rich text)
 *
 * @constructor
 * @param {Controller} controller    - The controller for the app
 * @param {NodeModel} nodeToEdit     - The node that is being edited.
 * @param {string}    firstCharacter - If not null, this is a character that
 *                                     should overwrite the contents of the node
 */
export function EditNodeDialog(controller, nodeToEdit, firstCharacter) {
   this._controller = controller;
   this._nodeToEdit = nodeToEdit;

   let allText;
   let columns;
   let domParser;
   let html;
   let htmlAsDoc;
   let i;
   let numRows;
   let textArea;

   //--------------------------------------------------------------------------
   // Try to pick a reasonable width for the textarea
   //--------------------------------------------------------------------------
   columns = Math.min(80, 0.8*(Sizer.svgWidth / Sizer.characterWidth));

   //--------------------------------------------------------------------------
   // Tags to be added
   // We start with the textarea having the same number of rows as there are
   // lines of text in the node, up to a maximum of 5 (remember phones have
   // small screens).
   //--------------------------------------------------------------------------
   numRows = Math.min(MAX_ROWS, nodeToEdit.getText().length);

   html = `<div id='${EditNodeDialog.DIALOG_ID}' class='popup' ` +
             `style='height: ${Sizer.popupHeight}px'> <p> Edit Node </p>` +
             `<textarea id='${EditNodeDialog.TEXT_ENTRY_FIELD_ID}' ` +
             `rows='${numRows}' cols='${columns}'>`;

             nodeToEdit.getText().forEach( function(line, index) {
                if (index !== 0) {
                   html += '\n';
                }
                html += line;
             });

             html += "</textarea> <br><br>" +
             `<button id='${EditNodeDialog.SAVE_ID}'>Save</button>` +
             `<button id='${EditNodeDialog.CANCEL_ID}'>Cancel</button>` +
             `<button id='${EditNodeDialog.LINE_BREAK}'>Line Break</button>` +
          '</div>';

   //--------------------------------------------------------------------------
   // Create the dialog
   //--------------------------------------------------------------------------
   domParser = new DOMParser();
   htmlAsDoc = domParser.parseFromString(html, 'text/html');
   this._editNodeDialog = document.importNode(
      htmlAsDoc.getElementById(EditNodeDialog.DIALOG_ID),
      true
   );
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .appendChild(this._editNodeDialog);

   this._textEntryField =
      document.getElementById(EditNodeDialog.TEXT_ENTRY_FIELD_ID);

   //--------------------------------------------------------------------------
   // Add our listeners
   //--------------------------------------------------------------------------
   document.getElementById(EditNodeDialog.SAVE_ID).addEventListener(
      'click',
      () => this.save()
   );

   document.getElementById(EditNodeDialog.CANCEL_ID).addEventListener(
      'click',
      () => this.close()
   );

   document.getElementById(EditNodeDialog.LINE_BREAK).addEventListener(
      'click',
      () => this.lineBreakClicked()
   );

   this._textEntryField.addEventListener(
      'keypress',
      (e) => {

         switch(e.key) {

            //-----------------------------------------------------------------
            // Escape - Same as cancel
            //-----------------------------------------------------------------
            case 'Escape':
               this.close();
               e.stopPropagation();
               break;

            //-----------------------------------------------------------------
            // Enter:
            //    - With CTRL key   : Insert a line break
            //    - Without CTRL key: Save
            //-----------------------------------------------------------------
            case 'Enter':
               if (e.ctrlKey) {
                  this.lineBreakClicked();
               } else {
                  this.save();
               }
               e.stopPropagation();
               break;

            default:
               break;
         }
         this.adjustHeight();
      }
   );

   //--------------------------------------------------------------------------
   // Make the app-popups div visible and set state
   //--------------------------------------------------------------------------
   document.getElementById(`${App.HTML_ID_PREFIX}-popups`)
           .removeAttribute('hidden');
   m3App.getGlobalState().setState(State.STATE_DIALOG_EDIT_NODE);

   //--------------------------------------------------------------------------
   // Give the input field focus and either:
   //    - select all the text
   //    - or overwrite with the specified character
   //--------------------------------------------------------------------------
   this._textEntryField.focus();
   if (firstCharacter === null) {
      this._textEntryField.select();
   } else {
      this._textEntryField.value = firstCharacter;
   }

   //--------------------------------------------------------------------------
   // Hack to get enough rows visible when first show dialog
   //--------------------------------------------------------------------------
   for (i = 0; i < MAX_ROWS; i++) {
      this.adjustHeight();
   }

} // EditNodeDialog()

EditNodeDialog.DIALOG_ID = `${App.HTML_ID_PREFIX}-editNodeDialog`;

EditNodeDialog.CANCEL_ID = EditNodeDialog.DIALOG_ID + 'Cancel';
EditNodeDialog.LINE_BREAK = EditNodeDialog.DIALOG_ID + 'LineBreak';
EditNodeDialog.SAVE_ID = EditNodeDialog.DIALOG_ID + 'Save';
EditNodeDialog.TEXT_ENTRY_FIELD_ID = EditNodeDialog.DIALOG_ID + 'TextEntry';

/**
 * Adjust the height of the input field so MAX_HEIGHT worth of pixels are
 * visible (only if current content not all visible)
 *
 * @return {void}
 */
EditNodeDialog.prototype.adjustHeight = function adjustHeight() {
   let field = this._textEntryField;

   if (field.scrollHeight > field.clientHeight &&
       field.clientHeight <= MAX_HEIGHT
   ) {
      field.rows++;
   }
}; // adjustHeight()

/**
 * Close this EditNode Dialog:
 *    - Make the global popups div hidden
 *    - Delete the EditNode div
 *    - Set state back to IDLE
 *
 * @return {void}
 */
EditNodeDialog.prototype.close = function close() {
   let appPopups;

   appPopups = document.getElementById(`${App.HTML_ID_PREFIX}-popups`);
   appPopups.setAttribute('hidden', 'true');
   appPopups.removeChild(this._editNodeDialog);

   m3App.getGlobalState().setState(State.STATE_IDLE);

   // Making the edited node the currently selected one means the user
   // can use addchild or addSibling to create anything without having
   // to select a different node first.
   this._controller.getMapViewController().setSelectedNodeView(
      this._nodeToEdit.getView());
}; // close()

/**
 *
 * Line break clicked
 *
 * @return {void}
 */
EditNodeDialog.prototype.lineBreakClicked = function lineBreakClicked() {
   let currentText;
   let cursorPosition;

   currentText = this._textEntryField.value;
   cursorPosition = this._textEntryField.selectionEnd;

   // Insert new line character immediately after the cursor position
   this._textEntryField.value =
      currentText.substring(0, cursorPosition) +
      '\n' +
      currentText.substring(cursorPosition);

   // Deal with case where user clicked button rather than doing CTRL-enter
   //    - Reset focus on this field
   //    - Reset the cursor position
   //    - Adjust height
   this._textEntryField.focus();
   this._textEntryField.selectionEnd = cursorPosition + 1;
   this.adjustHeight();
}; // lineBreakClicked()

/**
 * Save clicked
 *
 * @return {void}
 */
EditNodeDialog.prototype.save = function save() {
   this._controller.changeNodeText(
      this._nodeToEdit,
      this._textEntryField.value.split('\n')
   );
   this.close();
}; // save()
