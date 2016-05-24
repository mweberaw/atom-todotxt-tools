{CompositeDisposable} = require 'atom'

module.exports =
  provider: null
  subscriptions: null

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-text-editor',
      'todotxt:add-todo': => @addTodo()

  deactivate: ->
    @subscriptions?.dispose()
    @subscriptions = null
    @provider = null

  addTodo: ->
    editor = atom.workspace.getActiveTextEditor()
    editor.moveToBottom()
    today = new Date()
    editor.insertText(today.toISOString()[0..9] + ' ')

  provideAutocomplete: ->
    unless @provider?
      AutocompleteProvider = require './todotxt-autocompleteprovider'
      @provider = new AutocompleteProvider()
    @provider
