const minimatch = require("minimatch");
const { shouldIgnore, didIgnorePatternsChange } = require("./ignore");
const vscode = require("vscode");

class WordCounter {
  async getWordCount(path) {
    if (shouldIgnore(path)) {
      return 0;
    }
    const doc = await vscode.workspace.openTextDocument(path);
    return this._getWordCountForDoc(doc);
  }

  _getWordCountForDoc(doc) {
    return this._getWordCount(doc);
  }

  isDocInDocumentRoot(documentRoot, doc) {
    if (doc.uri && documentRoot) {
      return doc.uri.fsPath.startsWith(documentRoot.fsPath);
    }
    return false;
  }

  getCurrentDocWordCount(documentRoot) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) return 0;
    let doc = editor.document;
    if (shouldIgnore(doc.uri)) return 0;
    if (!this.isDocInDocumentRoot(documentRoot, doc)) return 0;

    const xglob = vscode.workspace
      .getConfiguration()
      .get("codexManuscriptWordcount.globPatterns") || ["*.md"];

    if (
      !xglob.some((pattern) =>
        minimatch(
          vscode.workspace.asRelativePath(doc.uri.fsPath),
          "**/" + pattern
        )
      )
    )
      return 0;
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

module.exports = {
  WordCounter,
};
