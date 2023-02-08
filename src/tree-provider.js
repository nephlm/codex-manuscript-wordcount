const vscode = require("vscode");
const { Manuscript, Session } = require("./manuscript");
const { Node } = require("./nodes");
const { refreshRequiredEvent } = require("./events");
const { progressBar, getProgressCharacter } = require("./progress");

let rootId = 1;
let manuscriptId = 2;
let manuscriptCountId = 3;
let manuscriptBarId = 4;
let sessionId = 5;
let sessionCountId = 6;
let sessionBarId = 7;

// const nodeIndex = {
//   rootId: root,
//   manuscriptId: manuscript,
//   manuscriptCountId: manuscriptCount,
//   manuscriptBarId: manuscriptProgress,
//   sessionId: session,
//   sessionCountId: sessionCount,
//   sessionBarId: sessionProgress,
// };

const sessionContext = "session";
const manuscriptContext = "manuscript";

// arg structure
// const arg = {
//   sessionCurrent: n,
//   sessionGoal: n,
//   manuscriptCurrent: n,
//   manuscriptGoal: n,
// }

const sessionCountDisplay = (arg) => {
  return "Session Count: " + arg.sessionCurrent + " / " + arg.sessionGoal;
};
const sessionBar = (arg) => {
  return progressBar(arg.sessionCurrent, arg.sessionGoal);
};
const manuscriptCountDisplay = (arg) => {
  return (
    "Manuscript Count: " + arg.manuscriptCurrent + "  /  " + arg.manuscriptGoal
  );
};
const manuscriptBar = (arg) => {
  return progressBar(arg.manuscriptCurrent, arg.manuscriptGoal);
};
const manuscriptLabel = (arg) => {
  return (
    "Manuscript  " +
    getProgressCharacter(arg.manuscriptCurrent, arg.manuscriptGoal)
  );
};
const sessionLabel = (arg) => {
  return (
    "Session  " + getProgressCharacter(arg.sessionCurrent, arg.sessionGoal)
  );
};

const sessionCount = new Node(sessionCountId, sessionCountDisplay);
const sessionProgress = new Node(sessionBarId, sessionBar);
const session = new Node(sessionId, sessionLabel);
session.children = [sessionCount, sessionProgress];
// sessionCount.parent = session;
// sessionProgress.parent = session;

const manuscriptCount = new Node(manuscriptCountId, manuscriptCountDisplay);
const manuscriptProgress = new Node(manuscriptBarId, manuscriptBar);
const manuscript = new Node(manuscriptId, manuscriptLabel);
manuscript.children = [manuscriptCount, manuscriptProgress];
// manuscriptCount.parent = manuscript;
// manuscriptProgress.parent = manuscript;

const root = new Node(rootId, () => {});
root.children = [manuscript, session];
// manuscript.parent = root;
// session.parent = root;

let idCounter = 0;
let nodeIndex = {};

function assignIds(node, parent = null) {
  node.id = idCounter;
  nodeIndex[idCounter] = node;
  idCounter++;
  node.parent = parent;

  if (node.children) {
    node.children.forEach((child) => assignIds(child, node));
  }
}
assignIds(root, null);
manuscript.setContext(manuscriptContext);
session.setContext(sessionContext);

//========================================================================

class TItem extends vscode.TreeItem {
  constructor(
    element,
    id,
    collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
  ) {
    super(element, collapsibleState);
    this.id = id;
    this.label = element;
    this.collapsibleState = collapsibleState;
    // this.element = element;
    this.node = nodeIndex[id];
    this.contextValue = this.node.context;

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

const nodeToTItem = function (node, arg, collapsibleState) {
  const newTItem = new TItem(node.label(arg), node.id, collapsibleState);
  return newTItem;
};

// let topLevel = [manuscriptId, sessionId];
// let sessionArray = [sessionId, sessionCountId];

// let manuscriptItem = new TItem({ label: "Manuscript", id: manuscriptId });
// let sessionItem = new TItem({ label: "Session", id: sessionId });

// let struct = {
//   [manuscriptItem.id]: [
//     new TItem({ label: "Manuscript Progress: ", id: manuscriptCountId }),
//   ],
//   [manuscriptCountId]: [],
//   [sessionItem.id]: [
//     new TItem({ label: "Session Progress: ", id: sessionCountId }),
//   ],
//   [sessionCountId]: [],
//   null: [manuscriptItem, sessionItem],
// };

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
    vscode.workspace.onDidSaveTextDocument(boundOnEvent, this, subscriptions);
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
    refreshRequiredEvent.event(async () => {
      // console.log("refresh requested");
      this.manuscript.refresh().then(() => {
        this._onEvent();
        this.update();
      });
    });
  }

  setDocumentRoot() {
    const boundUpdate = this.update.bind(this);
    this.manuscript.setDocumentRoot(boundUpdate);
  }

  //========================================================================
  // Tree Provider

  getLabelArg() {
    return {
      manuscriptCurrent: this.manuscript.total(),
      manuscriptGoal: this.manuscript.goal,
      sessionCurrent: this.session.total(),
      sessionGoal: this.session.goal,
    };
  }

  getTreeItem(element) {
    const node = nodeIndex[element.id];
    let newElement = nodeToTItem(node, this.getLabelArg());
    if (!node.hasChildren()) {
      newElement.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
    return newElement;
  }

  getChildren(element) {
    var node;
    if (!element) {
      node = root;
    } else {
      node = nodeIndex[element.id];
    }
    var items = [];
    const args = this.getLabelArg();
    for (const child of node.children) {
      items.push(nodeToTItem(child, args));
    }
    return items;

    // return struct[element.id];
  }

  getParent(element) {
    const node = nodeIndex[element.id];
    const args = this.getLabelArg();
    return nodeToTItem(node, args);
    // if (element.id === manuscriptCountId) {
    //   return manuscriptItem;
    // } else if (element.id === sessionCountId) {
    //   return sessionItem;
    // }
    // return null;
  }

  // =======================================================================
  // update tree

  update() {
    this._onDidChangeTreeData.fire();
  }

  _onEvent() {
    if (this === undefined) {
      return;
    }
    let oldTotal = this.total;
    const total = this.manuscript.total(true);
    if (
      total === 0 &&
      (!isNaN(this.manuscript.numberOfFilesFound) ||
        this.manuscript.numberOfFilesFound > 1)
    ) {
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
