const vscode = require("vscode");
// const { WordCounter } = require("./document-wordcounter");
// const { CountCache } = require("./count-cache");
const { Manuscript, Session } = require("./manuscript");

class TItem extends vscode.TreeItem {
  constructor(
    element,
    id,
    collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
  ) {
    super(element.label, collapsibleState);
    this.id = id || element.id;
    this.label = element.label;
    this.collapsibleState = collapsibleState;
    this.element = element;
    this.contextValue = "manuscript";
    if (sessionArray.includes(this.id)) {
      this.contextValue = "session";
    }

    let subscriptions = [];

    vscode.window.onDidChangeActiveTextEditor(
      this._onEvent,
      this,
      subscriptions
    );
    vscode.window.onDidChangeTextEditorSelection(
      this._onEvent,
      this,
      subscriptions
    );

    this._disposable = vscode.Disposable.from(...subscriptions);
  }

  // _onEvent() {
  //   if (this.manuscript) {
  //     this.count = this._wordCounter.total();
  //   }
  // }

  dispose() {
    this._disposable.dispose();
  }
}

//========================================================================

let manuscriptId = 1;
let manuscriptCountId = 2;
let sessionId = 3;
let sessionCountId = 4;

let topLevel = [manuscriptId, sessionId];
let sessionArray = [sessionId, sessionCountId];

let manuscriptItem = new TItem({ label: "Manuscript", id: manuscriptId });
let sessionItem = new TItem({ label: "Session", id: sessionId });

let struct = {
  [manuscriptItem.id]: [
    new TItem({ label: "Manuscript Progress: ", id: manuscriptCountId }),
  ],
  [manuscriptCountId]: [],
  [sessionItem.id]: [
    new TItem({ label: "Session Progress: ", id: sessionCountId }),
  ],
  [sessionCountId]: [],
  null: [manuscriptItem, sessionItem],
};

//========================================================================

class TreeProvider {
  constructor(context) {
    this.context = context;
    this.total = 0;
    const config = vscode.workspace.getConfiguration();
    this.manuscript = new Manuscript(
      config.get("codexManuscriptWordcount.defaultDocumentRoot") || null,
      config.get("codexManuscriptWordcount.defaultManuscriptGoal") || 50000,
      context
    );
    this.session = new Session(this.manuscript);
    this.total = this.manuscript.total();
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.manuscript.refresh().then(this._onEvent);

    setTimeout(async () => {
      this._onEvent();
      // await this.session.resetStart();
    }, 500);

    let subscriptions = [];
    const boundOnEvent = this._onEvent.bind(this);
    vscode.window.onDidChangeActiveTextEditor(
      boundOnEvent,
      this,
      subscriptions
    );
    vscode.window.onDidChangeTextEditorSelection(
      boundOnEvent,
      this,
      subscriptions
    );
    vscode.workspace.onDidDeleteFiles(async () => {
      this.manuscript.refresh().then(() => this._onEvent());
    });
  }

  setDocumentRoot() {
    const boundUpdate = this.update.bind(this);
    this.manuscript.setDocumentRoot(boundUpdate);
  }

  //========================================================================
  // Tree Provider

  getTreeItem(element) {
    let newElement = new TItem(element, element.id);
    if (element && struct[element.id].length == 0) {
      newElement.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    if (topLevel.includes(element.id)) {
      newElement.label = element.label;
    } else {
      var goal;
      var count;
      if (element.id == sessionCountId) {
        goal = this.session.goal;
        count = this.session.total();
      } else {
        goal = this.manuscript.goal;
        count = this.manuscript.total();
      }
      newElement.label = element.label + count + " / " + goal;
    }
    return newElement;
  }

  getChildren(element) {
    if (!element) {
      return struct[null];
    }
    return struct[element.id];
  }

  getParent(element) {
    if (element.id === manuscriptCountId) {
      return manuscriptItem;
    } else if (element.id === sessionCountId) {
      return sessionItem;
    }
    return null;
  }

  // =======================================================================
  // update tree

  update() {
    this._onDidChangeTreeData.fire();
  }

  _onEvent() {
    // console.log("on event called");
    if (this === undefined) {
      return;
    }
    let oldTotal = this.total;
    const total = this.manuscript.total(true);
    if (total === 0 && this.manuscript.numberOfFilesFound > 1) {
      const boundFunction = this._onEvent.bind(this);
      setTimeout(boundFunction, 500);
    }
    this.total = this.manuscript.total(true) + this.manuscript.getEditorCount();
    if (this.total != oldTotal) {
      this._onDidChangeTreeData.fire();
    }
  }

  get onDidChangeTreeData() {
    return this._onDidChangeTreeData.event;
  }
}

module.exports = { TItem, TreeProvider };
