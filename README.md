# claude-code-mods

Small, readable Claude Code mods from the CorporateChittyChat channel, each one made for a video.

| Mod | What it does | Video |
|---|---|---|
| [`token-meter`](token-meter/) | Shows the tokens each answer uses beside the spinner, and adds `/tokens` for the session total. Checking costs nothing: the mod never calls a model, and `/tokens` prints a line Claude doesn't read. | "Do Claude Code Mods Eat Your Tokens?" |

## Before you run any mod

A mod is code that runs with your own permissions. It can read your files and saved keys, and it isn't sandboxed. Read the code first: each mod here is short on purpose. Then check what it does without running it:

```
claude plugin validate ./token-meter
```

The `calls:` line lists everything the mod asks Claude Code to do.

Mods need Claude Code v2.1.287 or later. Docs: https://code.claude.com/docs/en/plugins/mods/overview

These mods are shared as-is, without support. They were written with Claude, an Anthropic product. Not affiliated with or endorsed by Anthropic.
