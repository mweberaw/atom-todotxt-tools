{CompositeDisposable} = require 'atom'

module.exports =
  provider: null
  subscriptions: null

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:add-todo': => @addTodo()
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:finish-todo': => @finishTodo()

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
    editor.moveToBeginningOfLine()
    editor.selectToEndOfLine()
    doneItem = editor.getSelectedText()
    editor.delete() # delete selection
    editor.delete() # delete newline
    editor.moveToBottom()
    if editor.getCursorBufferPosition().column isnt 0
      editor.insertNewline()
    editor.insertText(doneItem)
    editor.insertNewline()

  timestamp: (date) ->
    date.toISOString()[0..9]

  provideAutocomplete: ->
    unless @provider?
      AutocompleteProvider = require './todotxt-autocompleteprovider'
      @provider = new AutocompleteProvider()
    @provider
