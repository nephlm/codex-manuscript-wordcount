const fs = require("fs");
const minimatch = require("minimatch");

const vscode = require("vscode");

const utils = require("./utils");
const { refreshRequiredEvent } = require("./events");

const getIgnorePath = function () {
  if (utils.workspaceRoot() === undefined) {
    return undefined;
  }
  return vscode.Uri.joinPath(utils.workspaceRoot(), ".codexignore");
};

var ignorePath = getIgnorePath();

var cache_time = utils.now();
var cache;

let subscriptions = [];
// const boundOnEvent = this._onEvent.bind(this);
vscode.workspace.onDidSaveTextDocument(
  (e) => {
    if (!ignorePath) {
      ignorePath = getIgnorePath();
      return;
    }
    console.log(e.uri.fsPath)
    console.log(ignorePath.fsPath)
    console.log()
    if (e.uri.fsPath === ignorePath.fsPath) {
      // console.log("invalidating ignore cache");
      cache = undefined;
      didIgnorePatternsChange();
    }
  },
  undefined,
  subscriptions
);

function recent() {
  return utils.now() - cache_time < 5;
}

function didIgnorePatternsChange() {
  if (cache && recent()) {
    return false;
  }
  try {
    const ignoreFile = fs.readFileSync(ignorePath.fsPath, "utf-8");
    const ignorePatterns = ignoreFile
      .split("\n")
      .filter((pattern) => pattern[0] !== "#" && pattern.length > 0);
    if (JSON.stringify(cache) !== JSON.stringify(ignorePatterns)) {
      cache = ignorePatterns;
      cache_time = utils.now();
      refreshRequiredEvent.fire({ reason: "ignore patterns changed" });

      return true;
    }
    cache_time = utils.now();
    return false;
  } catch (e) {
    return false;
  }
}

function getIgnorePatterns() {
  if (cache && recent()) {
    return cache;
  }
  didIgnorePatternsChange();
  return cache;
}

function shouldIgnore(filePath) {
  const ignorePatterns = getIgnorePatterns();
  if (!ignorePatterns) return false;

  return ignorePatterns.some((pattern) => {
    return minimatch(filePath.fsPath, pattern, { dot: true, matchBase: true });
  });
}

module.exports = { shouldIgnore, didIgnorePatternsChange };
