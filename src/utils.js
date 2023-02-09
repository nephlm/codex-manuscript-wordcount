const vscode = require("vscode");

const workspaceRoot = function () {
  if (vscode.workspace.workspaceFolders) {
    return vscode.workspace.workspaceFolders[0].uri;
  }
  return undefined;
};

function now() {
  return Date.now() / 1000;
}

module.exports = {
  now,
  workspaceRoot,
};
