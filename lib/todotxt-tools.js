"use strict";
var atom_1 = require('atom');
var path = require('path');
var moment = require('moment');
var todotxt_autocompleteprovider_1 = require('./todotxt-autocompleteprovider');
var provider = null;
var subscriptions = null;
var todoView = null;
var todoPanel = null;
function activate(state) {
    subscriptions = new atom_1.CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:add-todo', function () { return addTodo(); }));
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:finish-todo', function () { return finishTodo(); }));
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:archive', function () { return archive(); }));
}
exports.activate = activate;
function deactivate() {
    if (todoPanel !== null) {
        todoPanel.destroy();
    }
    todoPanel = null;
    if (todoView !== null) {
        todoView.destroy();
    }
    todoView = null;
    if (subscriptions !== null) {
        subscriptions.dispose();
    }
    subscriptions = null;
    provider = null;
}
exports.deactivate = deactivate;
function addTodo() {
    var editor = atom.workspace.getActiveTextEditor();
    editor.moveToBottom();
    var position = editor.getCursorScreenPosition();
    while (position.row > 0 && editor.getTextInBufferRange([[position.row - 1, 0], [position.row - 1, 2]]) === 'x ') {
        editor.moveUp();
        position = editor.getCursorBufferPosition();
    }
    editor.insertNewlineAbove();
    var today = moment();
    editor.insertText(timestamp(today) + ' ');
}
function finishTodo() {
    var editor = atom.workspace.getActiveTextEditor();
    editor.selectLinesContainingCursors();
    var item = editor.getSelectedText();
    editor.delete();
    var recMatch = /rec:([+]?)(\d+)([dwmy])/.exec(item);
    if (recMatch !== null) {
        var amount = recMatch[2];
        var kind = recMatch[3];
        var nextDueBase = null;
        var dueMatch = /due:(\d{4}-\d{2}-\d{2})/.exec(item);
        if (dueMatch === null) {
            atom.notifications.addError("Invalid due date for recurring item!");
            editor.undo();
            editor.moveToBeginningOfLine();
            return;
        }
        if (recMatch[1] === '+') {
            nextDueBase = moment(dueMatch[1]);
        }
        else {
            nextDueBase = moment();
        }
        var nextDue = null;
        switch (kind) {
            case 'd':
            case 'w':
            case 'y':
                nextDue = nextDueBase.add(amount, kind);
                break;
            case 'm':
                nextDue = nextDueBase.add(amount, 'M');
        }
        var newItem = item
            .replace(/^\d{4}-\d{2}-\d{2} /, '')
            .replace(/due:(\d{4}-\d{2}-\d{2})/, "due:" + timestamp(nextDue))
            .replace(/[\n\r]+$/, '');
        addTodo();
        editor.insertText(newItem);
    }
    var doneItem = item.replace(/^\([A-Z]\) /, '');
    editor.moveToBottom();
    if (editor.getCursorBufferPosition().column !== 0) {
        editor.insertNewline();
    }
    var today = moment();
    editor.insertText("x " + timestamp(today) + " ");
    editor.insertText(doneItem);
    editor.save();
}
function timestamp(date) {
    return date.format('YYYY-MM-DD');
}
function archive() {
    var todoEditor = atom.workspace.getActiveTextEditor();
    var todoPath = todoEditor.getPath();
    var basedir = path.dirname(todoPath);
    atom.workspace.open(path.join(basedir, 'done.txt'))
        .then(function (doneEditor) {
        doneEditor.moveToBottom();
        if (doneEditor.getCursorBufferPosition().column !== 0) {
            doneEditor.insertNewline();
        }
        todoEditor.moveToBottom();
        if (todoEditor.getCursorBufferPosition().column !== 0) {
            todoEditor.insertNewline();
        }
        todoEditor.moveToTop();
        while (todoEditor.getCursorBufferPosition().row !== (todoEditor.getLineCount() - 1)) {
            todoEditor.selectLinesContainingCursors();
            var line = todoEditor.getSelectedText();
            if (/^x /.test(line)) {
                doneEditor.insertText(line);
                todoEditor.delete();
            }
            else {
                todoEditor.moveDown();
            }
        }
        todoEditor.save();
        doneEditor.save();
    });
}
function provideAutocomplete() {
    if (provider === null) {
        provider = new todotxt_autocompleteprovider_1.AutocompleteProvider();
    }
    return provider;
}
exports.provideAutocomplete = provideAutocomplete;
