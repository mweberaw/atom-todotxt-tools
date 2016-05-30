module.exports.startsContext= (s) ->
  s[0] is '@'

module.exports.startsProject= (s) ->
  s[0] is '+'

module.exports.findContexts= (text) ->
  regex = /@\w+/g
  text.match(regex) or []

module.exports.findProjects= (text) ->
  regex = /\+\w+/g
  text.match(regex) or []

module.exports.removeDuplicates = (ar) ->
  if ar.length == 0
    return []
  res = {}
  res[ar[key]] = ar[key] for key in [0..ar.length-1]
  value for key, value of res
