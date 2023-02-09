const vscode = require("vscode");
const { TreeProvider } = require("./tree-provider");
// const { WordCounterController } = require("./document-wordcounter");
// const { Manuscript } = require("./manuscript");

var treeProvider;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  console.log(
    'Congratulations, your extension "codex-manuscript-wordcount" is now active!'
  );
  console.log(vscode.workspace);
  while (!vscode.workspace.workspaceFolders) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  let treeview;
  treeProvider = new TreeProvider(context);

  treeview = vscode.window.createTreeView("codex-manuscript-wordcount_view", {
    treeDataProvider: treeProvider,
  });
  context.subscriptions.push(treeview);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codex-manuscript-wordcount.resetSession",
      function () {
        console.log("resetSession");
        treeProvider.session.resetStart().then(() => {
          treeProvider.update();
        });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codex-manuscript-wordcount.setSessionGoal",
      function (e) {
        console.log("setSessionGoal");
        vscode.window
          .showInputBox({
            prompt: "Set Your Session Goal",
            title: "Choose a Goal",
            value: treeProvider.session.goal || 1000,
          })
          .then((value) => {
            if (!isNaN(value)) {
              treeProvider.session.goal = value;
              treeProvider.update();
              vscode.workspace
                .getConfiguration()
                .update(
                  "codexManuscriptWordcount.defaultSessionGoal",
                  parseInt(value),
                  vscode.ConfigurationTarget.Workspace
                );
            }
          });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codex-manuscript-wordcount.setManuscriptGoal",
      function (e) {
        console.log("setManuscriptGoal");
        vscode.window
          .showInputBox({
            prompt: "Set Your Manuscript Goal",
            title: "Choose a Goal",
            value: treeProvider.manuscript.goal || 50000,
          })
          .then((value) => {
            if (!isNaN(value)) {
              treeProvider.manuscript.goal = value;
              treeProvider.update();
              vscode.workspace
                .getConfiguration()
                .update(
                  "codexManuscriptWordcount.defaultManuscriptGoal",
                  parseInt(value),
                  vscode.ConfigurationTarget.Workspace
                );
            }
          });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codex-manuscript-wordcount.setSessionCount",
      function (e) {
        console.log("setSessionCount");
        vscode.window
          .showInputBox({
            prompt:
              "This is the cheat box. ;-) " +
              "If you forgot to reset the session when you started working " +
              "and would like credit for the words you already wrote, " +
              "set the session to a non-zero value here.",
            title: "Set Session Current Count",
          })
          .then((value) => {
            if (!isNaN(value)) {
              const startValue = treeProvider.manuscript.total() - value;
              treeProvider.session.startCount = startValue;
              treeProvider.update();
              context.workspaceState.update(
                "codexManuscriptWordcount.sessionStartValue",
                startValue
              );
            }
          });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codex-manuscript-wordcount.setDocumentRoot",
      function (e) {
        console.log("setDocumentRoot");
        treeProvider.setDocumentRoot();
      }
    )
  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
  treeProvider,
};
