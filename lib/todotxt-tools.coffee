module.exports =
  provider: null

  activate: ->

  deactivate: ->
    @provider = null

  provideAutocomplete: ->
    unless @provider?
      AutocompleteProvider = require './todotxt-autocompleteprovider'
      @provider = new AutocompleteProvider()
    @provider
