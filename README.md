# <img src="https://raw.githubusercontent.com/nephlm/codex-manuscript-wordcount/main/logo_128.png" width=48>Codex Manuscript Wordcount

A VScode extension for counting the total word count of a manuscript split into multiple markdown files. It also includes a session word count and configurable manuscript and session goals.

## Features

- Configurable document root
- Session word count
- Manuscript word count
- Configurable manuscript and session goals
- Does not count words between < and >

## Installation

Search for `codex-manuscipt-wordcount` in the VScode extension marketplace and install it.

## Usage

After installation, the manuscript and session word counts will appear in the explorer. You can right-click on them to set the manuscript and session goals, as well as the document root where the manuscript is located. The extension will only count the words for Markdown documents under the document root.

You can also reset the session or adjust the session start by right-clicking on the session count. Additionally, there is an option in the settings to automatically reset the session on restart, which is off by default.

All of these settings are stored in the workspace config, and you can edit them there. However, there is no validation when editing them manually, so it may cause issues.

## Limitations

- Changing the document root while in the middle of a session may cause the session count to become inaccurate.
- Only supports workspaces with one root.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Related

- [Codex Autocommit](https://marketplace.visualstudio.com/items?itemName=ZenBrewismBooks.codex-autocommit&ssr=false#overview) - Automatically takes a snapshot of the manuscript every interval and stores it on a remote git server.

## Author

- [@nephlm](https://www.github.com/nephlm)
