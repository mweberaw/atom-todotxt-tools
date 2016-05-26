export class AutocompleteProvider {
  selector = '.text.todotxt'
  filterSuggestions = true

  getSuggestions(context: {editor: AtomCore.TextEditor; bufferPosition: AtomCore.Point; prefix: string}) {
    let editor = context.editor;
    let bufferPosition = context.bufferPosition;
    let prefix = this.getPrefix(editor, bufferPosition);
    let completeText = editor.getText();
    let suggestions: string[] = [];
    if (this.startsContext(prefix)) {
      let foundContexts = this.findContexts(completeText);
      suggestions = suggestions.concat(foundContexts);
    }
    if (this.startsProject(prefix)) {
      let foundProjects = this.findProjects(completeText);
      suggestions = suggestions.concat(foundProjects);
    }

    let completions = []
    for (let suggestion of suggestions) {
      completions.push(
        {
          type: 'value',
          text: suggestion,
          replacementPrefix: prefix,
          displayText: suggestion
        }
      );
    }

    return completions;
  }

  startsContext (s: string): boolean {
    return s[0] === '@';
  }

  startsProject (s: string): boolean {
    return s[0] === '+';
  }

  findContexts (text: string): string[] {
    let regex = /@\w+/g;
    return text.match(regex) || [];
  }

  findProjects (text: string): string[] {
    let regex = /\+\w+/g;
    return text.match(regex) || [];
  }

  getPrefix (editor: AtomCore.TextEditor, bufferPosition: AtomCore.Point): string {
    let regex = /[@+]\w*$/;

    // Get the text for the line up to the triggered buffer position
    let line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

    // Match the regex to the line, and return the match
    let match = line.match(regex);
    return match != null ? match[0] : '';
  }
}
