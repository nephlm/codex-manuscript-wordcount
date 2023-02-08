const vscode = require("vscode");

const workspaceRoot = function () {
  return vscode.workspace.workspaceFolders[0].uri;
};


function now() {
  return Date.now() / 1000;
}


module.exports = {
  now,
  workspaceRoot,
};
