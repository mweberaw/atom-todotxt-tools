"use strict";
var AutocompleteProvider = (function () {
    function AutocompleteProvider() {
        this.selector = '.text.todotxt';
        this.filterSuggestions = true;
    }
    AutocompleteProvider.prototype.getSuggestions = function (context) {
        var editor = context.editor;
        var bufferPosition = context.bufferPosition;
        var prefix = this.getPrefix(editor, bufferPosition);
        var completeText = editor.getText();
        var suggestions = [];
        if (this.startsContext(prefix)) {
            var foundContexts = this.findContexts(completeText);
            suggestions = suggestions.concat(foundContexts);
        }
        if (this.startsProject(prefix)) {
            var foundProjects = this.findProjects(completeText);
            suggestions = suggestions.concat(foundProjects);
        }
        var completions = [];
        for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
            var suggestion = suggestions_1[_i];
            completions.push({
                type: 'value',
                text: suggestion,
                replacementPrefix: prefix,
                displayText: suggestion
            });
        }
        return completions;
    };
    AutocompleteProvider.prototype.startsContext = function (s) {
        return s[0] === '@';
    };
    AutocompleteProvider.prototype.startsProject = function (s) {
        return s[0] === '+';
    };
    AutocompleteProvider.prototype.findContexts = function (text) {
        var regex = /@\w+/g;
        return text.match(regex) || [];
    };
    AutocompleteProvider.prototype.findProjects = function (text) {
        var regex = /\+\w+/g;
        return text.match(regex) || [];
    };
    AutocompleteProvider.prototype.getPrefix = function (editor, bufferPosition) {
        var regex = /[@+]\w*$/;
        var line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
        var match = line.match(regex);
        return match != null ? match[0] : '';
    };
    return AutocompleteProvider;
}());
exports.AutocompleteProvider = AutocompleteProvider;
