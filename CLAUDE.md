# MortWise — Claude Code Instructions

## Git workflow

- Develop all changes on the designated feature branch (see session context).
- **At the end of every task: create a pull request and merge it into main.**
  Use the GitHub MCP tools (`mcp__github__create_pull_request`, then `mcp__github__merge_pull_request`) to do this automatically after pushing.
- Always bump `package.json` version for each release and report the version when done.

## Versioning

- Increment the patch or minor version in `package.json` for every task.
- Report the final version number in the closing message to the user.
