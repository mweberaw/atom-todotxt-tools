fs = require 'fs'
path = require 'path'

module.exports =
class AutocompleteProvider
  selector: '.text.todotxt'
  filterSuggestions: true

  constructor: ->

  getSuggestions: ({editor, bufferPosition, prefix}) ->
    prefix = @getPrefix(editor, bufferPosition)
    completeText = editor.getText()
    suggestions = []
    if @startsContext(prefix)
      suggestions.push(context) for context in @findContexts(completeText)
    if @startsProject(prefix)
      suggestions.push(project) for project in @findProjects(completeText)

    completions = []
    for suggestion in suggestions
      completions.push
        type: 'value'
        text: suggestion
        replacementPrefix: prefix
        displayText: suggestion

    completions


  startsContext: (s) ->
    s[0] is '@'

  startsProject: (s) ->
    s[0] is '+'

  findContexts: (text) ->
    regex = /@\w+/g
    text.match(regex) or []

  findProjects: (text) ->
    regex = /\+\w+/g
    text.match(regex) or []

  getPrefix: (editor, bufferPosition) ->
    regex = /[@+]\w*$/

    # Get the text for the line up to the triggered buffer position
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])

    # Match the regex to the line, and return the match
    line.match(regex)?[0] or ''
