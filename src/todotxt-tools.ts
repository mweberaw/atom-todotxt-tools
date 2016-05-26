import {CompositeDisposable} from 'atom';
import {AutocompleteProvider} from './todotxt-autocompleteprovider';

let provider: AutocompleteProvider = null;
let subscriptions: CompositeDisposable = null;

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-text-editor',
    'todotxt:add-todo', ()=> addTodo()));
  subscriptions.add(atom.commands.add('atom-text-editor',
    'todotxt:finish-todo', ()=> finishTodo()));
}

export function deactivate() {
  if (subscriptions !== null) {
    subscriptions.dispose();
  }
  subscriptions = null;
  provider = null
}

function addTodo() {
  let editor = atom.workspace.getActiveTextEditor()
  editor.moveToBottom()
  if (editor.getCursorBufferPosition().column !== 0) {
    editor.insertNewline();
  }
  let today = new Date();
  editor.insertText(timestamp(today) + ' ');
}

function finishTodo() {
  let editor = atom.workspace.getActiveTextEditor()
  editor.moveToBeginningOfLine()
  let position = editor.getCursorBufferPosition()
  let prefix = editor.getTextInBufferRange([[position.row, 0], [position.row, 4]])
  if (/\([A-Z]\) /.test(prefix)) {
    editor.setSelectedBufferRange([[position.row, 0], [position.row, 4]])
    editor.delete()
  }
  let today = new Date()
  editor.insertText("x " + timestamp(today) + " ")
  editor.selectLinesContainingCursors()
  let doneItem = editor.getSelectedText()
  editor.delete() // delete selection
  editor.delete() // delete newline
  editor.moveToBottom()
  if (editor.getCursorBufferPosition().column !== 0) {
    editor.insertNewline()
  }
  editor.insertText(doneItem)
  editor.insertNewline()
}

function timestamp(date: Date) {
  return date.toISOString().substr(0, 10);
}

export function provideAutocomplete() {
  if (provider === null) {
    provider = new AutocompleteProvider();
  }
  return provider;
}
