const vscode = require("vscode");
const { TItem, TreeProvider } = require("./tree-provider");
// const { WordCounterController } = require("./document-wordcounter");
const { Manuscript } = require("./manuscript");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(
    'Congratulations, your extension "codex-manuscript-wordcount" is now active!'
  );

  let treeview;
  let treeProvider = new TreeProvider(context);
  // let wordCountController;

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
      "codex-manuscript-wordcount.setSessionStartCount",
      function (e) {
        console.log("setSessionStart");
        vscode.window
          .showInputBox({
            prompt:
              "This is the cheat box. ;-) " +
              "If you forgot to reset the session when you started working " +
              "and would like to reset the start of the session " +
              "to some value below the current manuscript count, you set it here.",
            title: "Set Session Start Count",
          })
          .then((value) => {
            if (!isNaN(value)) {
              treeProvider.session.startCount = value;
              treeProvider.update();
              context.workspaceState.update(
                "codexManuscriptWordcount.sessionStartValue",
                value
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
};
