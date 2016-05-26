import {CompositeDisposable} from 'atom';
import path = require('path')
import {AutocompleteProvider} from './todotxt-autocompleteprovider';

let provider: AutocompleteProvider = null;
let subscriptions: CompositeDisposable = null;

export function activate() {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-text-editor',
    'todotxt:add-todo', ()=> addTodo()));
  subscriptions.add(atom.commands.add('atom-text-editor',
    'todotxt:finish-todo', ()=> finishTodo()));
  subscriptions.add(atom.commands.add('atom-text-editor',
    'todotxt:archive', ()=> archive()));
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
  editor.delete()
  editor.moveToBottom()
  if (editor.getCursorBufferPosition().column !== 0) {
    editor.insertNewline()
  }
  editor.insertText(doneItem)
  editor.save()
}

function timestamp(date: Date) {
  return date.toISOString().substr(0, 10);
}

function archive() {
  let todoEditor = atom.workspace.getActiveTextEditor()
  let todoPath = todoEditor.getPath()
  let basedir = path.dirname(todoPath)
  atom.workspace.open(path.join(basedir, 'done.txt'))
  .then((doneEditor: AtomCore.TextEditor) => {
    doneEditor.moveToBottom()
    if (doneEditor.getCursorBufferPosition().column !== 0) {
      doneEditor.insertNewline()
    }
    todoEditor.moveToBottom()
    if (todoEditor.getCursorBufferPosition().column !== 0) {
      todoEditor.insertNewline()
    }
    todoEditor.moveToTop()
    while (todoEditor.getCursorBufferPosition().row !== (todoEditor.getLineCount() - 1)) {
      todoEditor.selectLinesContainingCursors()
      let line = todoEditor.getSelectedText()
      if (/^x /.test(line)) {
        doneEditor.insertText(line)
        todoEditor.delete()
      } else {
        todoEditor.moveDown()
      }
    }
    todoEditor.save()
    doneEditor.save()
  })
}

export function provideAutocomplete() {
  if (provider === null) {
    provider = new AutocompleteProvider();
  }
  return provider;
}
