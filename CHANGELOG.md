# Change Log

All notable changes to the "codex-manuscript-wordcount" extension will be documented in this file.

## [0.4.2]

- Armored against windows with no workspace open.  May still be some issues there.
- Squashed a bug that would spit out tracebacks, though I don't think it would have any functional impact.  

## [0.4.0]

- Shortened progress bar, so it should be about the length of the text.
- Changed the option to set session starting count to the more reasonable `Set Session Start` which directly sets the value of the session count rather than making the user do math.
- Now honors a `.codexignore` file of the same format of `.gitignore` to skip files matching the patterns.  

## [0.3.0]

- Progress bars
- (not that you care, but) a lot of refactoring and cleaning up code to be more maintainable.

## [0.2.0]

- Initial release 