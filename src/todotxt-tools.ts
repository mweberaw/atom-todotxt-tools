import {CompositeDisposable} from 'atom';
import path = require('path')
import moment = require('moment')
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
  let position = editor.getCursorScreenPosition()
  while (position.row > 0 && editor.getTextInBufferRange([[position.row-1, 0], [position.row-1, 2]]) === 'x ') {
    editor.moveUp()
    position = editor.getCursorBufferPosition()
  }
  editor.insertNewlineAbove()
  let today = moment()
  editor.insertText(timestamp(today) + ' ');
}

function finishTodo() {
  let editor = atom.workspace.getActiveTextEditor()
  editor.selectLinesContainingCursors()
  // extract and delete old item
  let item = editor.getSelectedText()
  editor.delete()

  let recMatch = /rec:([+]?)(\d+)([dwmy])/.exec(item)
  if (recMatch !== null) {
    // add new item with updated due-date
    let amount = recMatch[2]
    let kind = recMatch[3]
    let nextDueBase = null
    let dueMatch = /due:(\d{4}-\d{2}-\d{2})/.exec(item)
    if (dueMatch === null) {
      atom.notifications.addError("Invalid due date for recurring item!")
      editor.undo() // undo the delete operation
      editor.moveToBeginningOfLine()
      return;
    }

    if (recMatch[1] === '+') {
      nextDueBase = moment(dueMatch[1])
    } else {
      nextDueBase = moment()
    }

    let nextDue = null
    switch (kind) {
      case 'd':
      case 'w':
      case 'y':
        nextDue = nextDueBase.add(amount, kind)
        break;
      case 'm':
        nextDue = nextDueBase.add(amount, 'M')
    }
    let newItem = item
      .replace(/^\d{4}-\d{2}-\d{2} /, '')
      .replace(/due:(\d{4}-\d{2}-\d{2})/, `due:${timestamp(nextDue)}`)
      .replace(/[\n\r]+$/, '')
    addTodo()
    editor.insertText(newItem)
  }

  let doneItem = item.replace(/^\([A-Z]\) /, '')
  editor.moveToBottom()
  if (editor.getCursorBufferPosition().column !== 0) {
    editor.insertNewline()
  }
  let today = moment()
  // insert done item at the end
  editor.insertText("x " + timestamp(today) + " ")
  editor.insertText(doneItem)
  editor.save()
}

function timestamp(date: moment.Moment) {
  return date.format('YYYY-MM-DD')
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
