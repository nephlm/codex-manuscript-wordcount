# <img src="https://raw.githubusercontent.com/nephlm/codex-manuscript-wordcount/main/logo.png" width=48>Codex Manuscript Wordcount

A VScode extension for counting the **total word count of a manuscript split across multiple markdown files.** It also includes a session word count and configurable manuscript and session goals.

## Features

- Configurable document root
- Session word count
- Manuscript word count
- Configurable manuscript and session goals
- Does not count words between < and >
- Progress bars for manuscript and session goals
- Ignores files matching patterns in `.codexignore` file.

## Installation

Search for `codex-manuscipt-wordcount` in the VScode extension marketplace and install it.

## Usage

After installation, the manuscript and session word counts will appear in the explorer. You can right-click on them to set the manuscript and session goals, as well as the document root where the manuscript is located. The extension will only count the words for Markdown documents under the document root.

<img src="https://raw.githubusercontent.com/nephlm/codex-manuscript-wordcount/main/screenshot.png" width=350>

You can also reset the session or adjust the session count by right-clicking on the session count. Additionally, there is an option in the settings to automatically reset the session on restart, which is off by default.

All of these settings are stored in the workspace config, and you can edit them there. However, there is no validation when editing them manually, so it may cause issues.

You may create a `.codexignore` file in the root of your workspace in the same [format](https://www.w3schools.com/git/git_ignore.asp?remote=github) used by [.gitignore](https://git-scm.com/docs/gitignore), and the word counter will ignore any files which match the ignore patterns.

In general, each pattern should be `**/<directory>/**`.  One pattern per line.  Lines beginning with `#`, are considered comments and ignored.

## Limitations

- Changing the document root while in the middle of a session may cause the session count to become inaccurate.
- Only supports workspaces with one root.

## Related

- [Codex Autocommit](https://marketplace.visualstudio.com/items?itemName=ZenBrewismBooks.codex-autocommit&ssr=false#overview) - Automatically takes a snapshot of the manuscript every interval and stores it on a remote git server.

- [Codex Manuscript File Operations](https://marketplace.visualstudio.com/items?itemName=ZenBrewismBooks.codex-manuscript-file-operations) - A set of file operations to facilitate splitting and merging scenes and to maintaining the fileorder of the manuscript.

## Feedback

[Bugs, feature requests and comments](https://github.com/nephlm/codex-manuscript-wordcount/issues)

## License, Author and Logo Attribution

- Author: [@nephlm](https://www.github.com/nephlm)
- License: [MIT](https://choosealicense.com/licenses/mit/)
- Logo by [Delapuite](https://game-icons.net/1x1/delapouite/abacus.html) under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)
