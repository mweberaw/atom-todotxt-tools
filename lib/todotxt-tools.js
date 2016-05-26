"use strict";
var atom_1 = require('atom');
var path = require('path');
var todotxt_autocompleteprovider_1 = require('./todotxt-autocompleteprovider');
var provider = null;
var subscriptions = null;
function activate() {
    subscriptions = new atom_1.CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:add-todo', function () { return addTodo(); }));
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:finish-todo', function () { return finishTodo(); }));
    subscriptions.add(atom.commands.add('atom-text-editor', 'todotxt:archive', function () { return archive(); }));
}
exports.activate = activate;
function deactivate() {
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
    if (editor.getCursorBufferPosition().column !== 0) {
        editor.insertNewline();
    }
    var today = new Date();
    editor.insertText(timestamp(today) + ' ');
}
function finishTodo() {
    var editor = atom.workspace.getActiveTextEditor();
    editor.moveToBeginningOfLine();
    var position = editor.getCursorBufferPosition();
    var prefix = editor.getTextInBufferRange([[position.row, 0], [position.row, 4]]);
    if (/\([A-Z]\) /.test(prefix)) {
        editor.setSelectedBufferRange([[position.row, 0], [position.row, 4]]);
        editor.delete();
    }
    var today = new Date();
    editor.insertText("x " + timestamp(today) + " ");
    editor.selectLinesContainingCursors();
    var doneItem = editor.getSelectedText();
    editor.delete();
    editor.moveToBottom();
    if (editor.getCursorBufferPosition().column !== 0) {
        editor.insertNewline();
    }
    editor.insertText(doneItem);
    editor.save();
}
function timestamp(date) {
    return date.toISOString().substr(0, 10);
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
