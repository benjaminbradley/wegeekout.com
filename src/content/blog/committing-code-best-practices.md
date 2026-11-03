---
title: "Committing code – best practices"
path: "/2022/04/21/committing-code-best-practices/"
description: "Source control management, or SCM, is used to track changes in files over time. Software source code evolves as new features are added and tracking the history…"
pubDate: 2022-04-21
tags: ["howto", "programming", "tips"]
legacy:
  drupalNid: 35
  originalDrupalDate: 2015-04-09
  source: "wordpress"
draft: false
---
<img alt="example output from a git diff command" src="/sites/wegeekout.com/files/git-diff2-250.png" width="250" height="150" class="float-right">Source control management, or SCM, is used to track changes in files over time. Software source code evolves as new features are added and tracking the history makes it easy to go back (revert) to an earlier version of the code. SCM enables several people to update different areas of the code at the same time and have reasonable confidence that their changes will be compatible with each other. When you’ve finished your task you “check in” your changes which makes them available to everyone else. Since your changes can affect many other people working on the same project, including your future self (when you come back to update the code again later), paying extra attention to what you’re publishing can make a big difference in keeping things stable, simple and readable. Here are some of the best practices that I’ve collected oven the years.

NOTE: The example commands below use git, but the ideas can be applied (via different commands) to every source control system.

## Do your own code review before you check in the code

This compares your code files to what’s currently in the repository and shows you any changes that have been made. Doing a read-through of the changes you’ve made can surface many of the items below, as well as basic mistakes like typos in documentation and formatting inconsistencies.

In git:\
`$ git status`\
`$ git diff`

The *git status* command will tell you which files were changed, and if any were added/removed.\
The *git diff* command shows you a line-by-line comparison of which lines were modified in each file.

## Keep it functional

If you’re implementing a big feature set, it can be tempting to commit\
each commit should be leave the codebase in a functional state (i.e. nothing is broken)

## Check regression tests (if available)

Often modern programming frameworks include\
this can tell you right away if your changes have broken the expectations for how the software works. It can also tell you when tests need to be updated. For example, when adding a new field value to your data model, you usually need to add a value for the new field to your test data.\
#TODO: how to run the tests – Akul

## Revert temporary file changes

Were any files changed **temporarily** during development? Maybe you downloaded a file that you no longer need, or modified configuration options to make it easier to develop. NOTE: If you find yourself consistently making changes to enable development, like switching to a local database, consider moving these environment-specific settings out to a separate configuration file which is not included in your SCM repository.\
These temporary changes should be reverted before you do your commit.\
To revert your changes in git, run the command:\
`$ git checkout <filename>`\
This will restore the version of the file(s) as they exist in the repository, overwriting any changes you’ve made.

## Batch changes into smaller commits

Did you make multiple batches of changes which can be separated into multiple commits?\
e.g. refactoring existing code; adding new code; moving/reorganizing files\
commit each batch separately\
This helps to differentiate and clarify the changes, which can be very useful if you want to un-do the changes later, or re-do/re-use the same type of changes in another area/context.

## Commit Messages

Every time you make a commit, it records which files were changed and how (added/removed/modified), when, and by whom. You also have the opportunity to add a brief text message with your changes. Each commit messages should include a description of what was changed, and a reference to the issue/bug number, task ID, etc., if there is one available\
**HINT:** If you can’t summarize your changes in one line, it may indicate that multiple commits would have been better.

## Sync often

If you’re working with a distributed SCM like git, you will need to pull any updates from the remote repository into your local repo before you can push your most recent changes back out again. Ideally, you will do this pull before you start working, in order to minimize the possibility of a merge conflict when you sync up at commit time. If you’re working from a forked repository, finish your workflow by making a pull request, inviting them to include your changes, to the parent repository.
