const vscode = require("vscode");

const refreshRequiredEvent = new vscode.EventEmitter();

// refreshRequiredEvent.event((eventData) => {
//   console.log(`Received event data: ${eventData}`);
// });

// refreshRequiredEvent.fire({ reason: "I wanted to", count: value });

module.exports = {
  refreshRequiredEvent,
};
