{CompositeDisposable} = require 'atom'
path = require('path')
moment = require('moment')

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
    position = editor.getCursorBufferPosition()
    while position.row > 0 and
          editor.getTextInBufferRange([[position.row-1, 0], [position.row-1, 2]]) is 'x '
      editor.moveUp()
      position = editor.getCursorBufferPosition()
    editor.insertNewlineAbove()
    today = moment()
    editor.insertText(@timestamp(today) + ' ')

  finishTodo: ->
    editor = atom.workspace.getActiveTextEditor()
    editor.selectLinesContainingCursors()
    # extract and delete old item
    item = editor.getSelectedText()
    editor.delete()

    recMatch = /rec:([+]?)(\d+)([dwmy])/.exec(item)
    if recMatch isnt null
      # add new item with updated due-date
      amount = recMatch[2]
      kind = recMatch[3]
      nextDueBase = null

      if recMatch[1] is '+'
        dueMatch = /due:(\d{4}-\d{2}-\d{2})/.exec(item)
        if dueMatch isnt null
          atom.notifications.addError('Invalid due date for recurring item!')
          editor.undo() # undo the delete operation
          return
        nextDueBase = moment(dueMatch[1])

      else
        nextDueBase = moment()

      nextDue = null
      switch kind
        when 'd','w','y'
          nextDue = nextDueBase.add(amount, kind)
        when 'm'
          nextDue = nextDueBase.add(amount, 'M')
      newItem = item.replace(/\d{4}-\d{2}-\d{2}/, @timestamp(moment()))
        .replace(/due:(\d{4}-\d{2}-\d{2})/, "due:#{@timestamp(nextDue)}")
      @addTodo()
      editor.insertText(newItem)

    doneItem = item.replace(/\([A-Z]\) /, '')
    editor.moveToBottom()
    if editor.getCursorBufferPosition().column isnt 0
      editor.insertNewline()
    today = moment()
    # insert done item at the end
    editor.insertText('x ' + @timestamp(today) + ' ')
    editor.insertText(doneItem)
    editor.save()

  timestamp: (date) ->
    date.format('YYYY-MM-DD')

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
          console.log("Cursor on line #{todoEditor.getCursorBufferPosition().row}")
          todoEditor.selectLinesContainingCursors()
          line = todoEditor.getSelectedText()
          if /^x /.test(line)
            doneEditor.insertText(line)
            todoEditor.delete()
          else
            todoEditor.moveToBeginningOfLine() # selection includes beginning of next line
        todoEditor.save()
        doneEditor.save()
        atom.workspace.open(todoPath)
      )

  provideAutocomplete: ->
    unless @provider?
      AutocompleteProvider = require './todotxt-autocompleteprovider'
      @provider = new AutocompleteProvider()
    @provider
