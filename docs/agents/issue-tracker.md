# Issue Tracker: GitHub

Issues and PRDs for this repo live in GitHub Issues:

`https://github.com/m-wysocki/ai-flashcard-generator/issues`

Use the `gh` CLI for issue operations when it is available and authenticated.

## Conventions

- Create an issue: `gh issue create --repo m-wysocki/ai-flashcard-generator --title "..." --body-file "..."`
- Read an issue: `gh issue view <number> --repo m-wysocki/ai-flashcard-generator --comments`
- List issues: `gh issue list --repo m-wysocki/ai-flashcard-generator --state open`
- Comment on an issue: `gh issue comment <number> --repo m-wysocki/ai-flashcard-generator --body "..."`
- Apply a label: `gh issue edit <number> --repo m-wysocki/ai-flashcard-generator --add-label "..."`
- Close an issue: `gh issue close <number> --repo m-wysocki/ai-flashcard-generator --comment "..."`

## Publishing PRDs

When a skill says to publish a PRD to the issue tracker, create a GitHub issue in this repo and apply the `ready-for-agent` label.

