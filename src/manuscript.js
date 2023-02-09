const vscode = require("vscode");

const { CountCache } = require("./count-cache");
const { WordCounter } = require("./document-wordcounter");
const { workspaceRoot } = require("./utils");

// let refreshPromises = [];

const getRelativePath = function (uri) {
  var relativePath = vscode.workspace.asRelativePath(uri);
  if (relativePath == uri.path) relativePath = "";
  return relativePath;
};

class Manuscript {
  constructor(documentRoot, goal, context) {
    this.context = context;
    this.documentRoot = undefined;
    if (!documentRoot && workspaceRoot()) {
      this.documentRoot = workspaceRoot();
    } else {
      const relative = vscode.workspace
        .getConfiguration()
        .get("codexManuscriptWordcount.defaultDocumentRoot");
      if (workspaceRoot() !== undefined) {
        this.documentRoot = workspaceRoot();
        this.documentRoot = vscode.Uri.joinPath(this.documentRoot, relative);
      }
    }
    this.goal =
      goal ||
      vscode.workspace
        .getConfiguration()
        .get("codexManuscriptWordcount.defaultManuscriptGoal") ||
      50000;
    this._cache = new CountCache();
    this._counter = new WordCounter();
    this._refreshInProgress = false;
    this.numberOfFilesFound = undefined;
  }

  async refresh() {
    if (!this.documentRoot) {
      return undefined
    }
    if (this._refreshInProgress) {
      while (this._refreshInProgress) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } else {
      try {
        this._refreshInProgress = true;
        this._cache.clearCache();

        if (this.documentRoot.uri !== undefined)
          this.documentRoot = this.documentRoot.uri;
        var relativePath = getRelativePath(this.documentRoot);
        var glob = "**/*.md";
        if (relativePath !== "") glob = "/" + glob;
        const files = await vscode.workspace.findFiles(relativePath + glob);

        var refreshPromises = [];
        for (const path of files) {
          const prom = this._counter.getWordCount(path).then((count) => {
            this._cache.setCache(path, count);
          });
          refreshPromises.push(prom);
        }
        this.numberOfFilesFound = files.length;
        await Promise.all(refreshPromises);
        this._refreshInProgress = false;
      } catch (error) {
        this._refreshInProgress = false;
        console.log("Manuscript.refresh Threw an error.");
        console.log(error);
      }
    }
  }

  total(excludeActive) {
    let count;
    let editor = vscode.window.activeTextEditor;
    if (
      excludeActive &&
      editor &&
      this._counter.isDocInDocumentRoot(this.documentRoot, editor.document)
    ) {
      count = this._cache.cacheSum(editor.document.uri);
    } else {
      count = this._cache.cacheSum();
    }
    if (isNaN(count)) {
      // not in the cache
      console.log("not in cache");
      this.refresh();
      return 0;
    }
    return count;
  }

  getEditorCount() {
    const currentDocCount = this._counter.getCurrentDocWordCount(
      this.documentRoot
    );
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this._cache.setCache(editor.document.uri, currentDocCount);
    }

    return currentDocCount;
  }

  async setDocumentRoot(callback) {
    if (workspaceRoot() === undefined) {
      vscode.window.showErrorMessage(
        "Can not set DocumentRoot until a workspace is opened."
      );
    } else {
      vscode.window
        .showOpenDialog({
          canSelectFolders: true,
          canSelectMany: false,
          defaultUri: workspaceRoot(),
          openLabel: "set",
          title: "Select the root folder of your manuscript",
        })
        .then(async (uriArray) => {
          if (this._validateDocumentRoot(uriArray)) {
            this.documentRoot = uriArray[0];
            var relativePath = getRelativePath(this.documentRoot);
            vscode.workspace
              .getConfiguration()
              .update(
                "codexManuscriptWordcount.defaultDocumentRoot",
                relativePath,
                vscode.ConfigurationTarget.Workspace
              );
            await this.refresh().then(() => {
              vscode.window.showInformationMessage(
                "Resetting the root will have unexpected results on your session count, you may want to reset it, or set the starting count."
              );
              callback();
            });
          }
        });
    }
  }

  _validateDocumentRoot(uriArray) {
    if (uriArray === undefined) return false;
    try {
      if (uriArray.length == 1) {
      } else {
        vscode.window.showErrorMessage(
          "You may only choose one root for your manuscript"
        );
        return false;
      }

      const uri = uriArray[0];

      const folders = vscode.workspace.workspaceFolders;
      if (folders === undefined) {
        vscode.window.showErrorMessage(
          "You must be in a workspace to choose a document root."
        );
        return false;
      }
      let isWithinWorkspace = false;
      vscode.workspace.workspaceFolders.forEach((workspaceFolder) => {
        if (uri.fsPath.startsWith(workspaceFolder.uri.fsPath)) {
          isWithinWorkspace = true;
        }
      });
      if (!isWithinWorkspace) {
        vscode.showErrorMessage(
          "The document root must be within the workspace."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      vscode.window.showErrorMessage(
        "An unanticipated error occurred when setting a document root."
      );
      return false;
    }
  }
}

class Session extends Manuscript {
  constructor(manuscript) {
    super(manuscript.documentRoot, manuscript.goal, manuscript.context);
    this.manuscript = manuscript;
    this.startCount = 0;
    this.goal =
      vscode.workspace
        .getConfiguration()
        .get("codexManuscriptWordcount.defaultSessionGoal") || 1000;

    setTimeout(async () => {
      const localStorage = this.context.workspaceState;
      if (
        vscode.workspace
          .getConfiguration()
          .get("codexManuscriptWordcount.resetSessionOnStart")
      ) {
        await this.manuscript.refresh();
        this.startCount = this.manuscript.total();
      } else {
        this.startCount = localStorage.get(
          "codexManuscriptWordcount.sessionStartValue"
        );
      }
      localStorage.update(
        "codexManuscriptWordcount.sessionStartValue",
        this.startCount
      );
    }, 750);
  }

  async resetStart() {
    await this.refresh();
    this.startCount = this.manuscript.total(false);
    this.context.workspaceState.update(
      "codexManuscriptWordcount.sessionStartValue",
      this.startCount
    );
  }

  total() {
    return this.manuscript.total(false) - this.startCount;
  }
}

module.exports = {
  Manuscript,
  Session,
};
