const vscode = require("vscode");

class WordCounter {
  async getWordCount(path) {
    const doc = await vscode.workspace.openTextDocument(path);
    return this._getWordCountForDoc(doc);
  }

  _getWordCountForDoc(doc) {
    if (doc.languageId == "markdown") {
      return this._getWordCount(doc);
    } else {
      return 0;
    }
  }

  isDocInDocumentRoot(documentRoot, doc) {
      return doc.uri.path.startsWith(documentRoot.path);
  }

  getCurrentDocWordCount(documentRoot) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) return 0;
    let doc = editor.document;
    if (!this.isDocInDocumentRoot(documentRoot, doc)) return 0;
    return this._getWordCountForDoc(doc);
  }

  _getWordCount(doc) {
    let docContent = doc.getText();

    docContent = docContent.replace(/(<[^>]+>)/g, "").replace(/\s+/g, " ");
    docContent = docContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    let wordCount = 0;
    if (docContent != "") {
      wordCount = docContent.split(" ").length;
    }

    return wordCount;
  }
}

// class WordCounterController {
//   constructor(wordCounter) {
//     this._wordCounter = wordCounter;
//     if (this._wordCounter) {
//       this.count = this._wordCounter.getCurrentDocWordCount();
//     } else {
//       this.count = 0;
//     }
//     this._disposable = null;

//     let subscriptions = [];
//     vscode.window.onDidChangeActiveTextEditor(
//       this._onEvent,
//       this,
//       subscriptions
//     );
//     vscode.window.onDidChangeTextEditorSelection(
//       this._onEvent,
//       this,
//       subscriptions
//     );

//     this._disposable = vscode.Disposable.from(...subscriptions);
//   }

//   _onEvent() {
//     if (this._wordCounter)
//       this.count = this._wordCounter.getCurrentDocWordCount();
//   }
//   dispose() {
//     this._disposable.dispose();
//   }
// }

module.exports = {
  WordCounter,
};
