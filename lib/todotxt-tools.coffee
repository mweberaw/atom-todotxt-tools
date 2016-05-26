{CompositeDisposable} = require 'atom'
path = require('path')

module.exports =
  provider: null
  subscriptions: null

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:add-todo': => @addTodo()
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:finish-todo': => @finishTodo()
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:archive': => @archive()

  deactivate: ->
    @subscriptions?.dispose()
    @subscriptions = null
    @provider = null

  addTodo: ->
    editor = atom.workspace.getActiveTextEditor()
    editor.moveToBottom()
    if editor.getCursorBufferPosition().column isnt 0
      editor.insertNewline()
    today = new Date()
    editor.insertText(@timestamp(today) + ' ')

  finishTodo: ->
    editor = atom.workspace.getActiveTextEditor()
    editor.moveToBeginningOfLine()
    position = editor.getCursorBufferPosition()
    prefix = editor.getTextInBufferRange([[position.row, 0], [position.row, 4]])
    if /\([A-Z]\) /.test(prefix)
      editor.setSelectedBufferRange([[position.row, 0], [position.row, 4]])
      editor.delete()
    today = new Date()
    editor.insertText("x " + @timestamp(today) + " ")
    todoEditor.selectLinesContainingCursors()
    doneItem = editor.getSelectedText()
    editor.delete()
    editor.moveToBottom()
    if editor.getCursorBufferPosition().column isnt 0
      editor.insertNewline()
    editor.insertText(doneItem)

  timestamp: (date) ->
    date.toISOString()[0..9]

  archive: () ->
    todoEditor = atom.workspace.getActiveTextEditor()
    todoPath = todoEditor.getPath()
    basedir = path.dirname(todoPath)
    atom.workspace.open(path.join(basedir, 'done.txt'))
      .then((doneEditor) ->
        doneEditor.moveToBottom()
        if doneEditor.getCursorBufferPosition().column isnt 0
          doneEditor.insertNewline()
        todoEditor.moveToBottom()
        if todoEditor.getCursorBufferPosition().column isnt 0
          todoEditor.insertNewline()
        todoEditor.moveToTop()
        while todoEditor.getCursorBufferPosition().row isnt (todoEditor.getLineCount() - 1)
          todoEditor.selectLinesContainingCursors()
          line = todoEditor.getSelectedText()
          if /^x /.test(line)
            doneEditor.insertText(line)
            todoEditor.delete()
          else
            todoEditor.moveDown()
        todoEditor.save()
        doneEditor.save()
        atom.workspace.open(todoPath)
      )

  provideAutocomplete: ->
    unless @provider?
      AutocompleteProvider = require './todotxt-autocompleteprovider'
      @provider = new AutocompleteProvider()
    @provider
