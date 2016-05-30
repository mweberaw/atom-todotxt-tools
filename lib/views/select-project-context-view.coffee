{$, $$} = require('atom-space-pen-views')

SelectListMultipleView = require('./select-list-multiple-view')

module.exports =
class SelectProjectContextView extends SelectListMultipleView
  initialize: (projects, contexts, @callback) ->
    super
    @show()
    @setItems(projects.concat contexts)
    @focusFilterEditor()

  getFilterKey: -> 'name'

  addButtons: ->
    viewButton = $$ ->
      @div class: 'select-list-buttons', =>
        @div =>
          @button class: 'btn btn-error inline-block-tight btn-cancel-button', 'Cancel'
        @div =>
          @button class: 'btn btn-success inline-block-tight btn-select-button', 'Select'
    viewButton.appendTo(this)

    @on 'click', 'button', ({target}) =>
      @complete() if $(target).hasClass('btn-select-button')
      @cancel() if $(target).hasClass('btn-cancel-button')

  show: ->
    @panel ?= atom.workspace.addModalPanel(item: this)
    @panel.show()
    @storeFocusedElement()

  cancelled: -> @hide()

  hide: -> @panel?.destroy()

  viewForItem: (item, matchedStr) ->
    $$ ->
      @li =>
        @div class: 'pull-right', =>
          @span class: 'inline-block highlight', item.type
        if matchedStr? then @raw(matchedStr) else @span item.name

  completed: (items) ->
    @cancel()
    @callback(items)
