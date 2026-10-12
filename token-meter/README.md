# token-meter

A small Claude Code mod that shows where your tokens go, live.

- While Claude works, the spinner shows the tokens the current answer has used so far, as in `Thinking · tokens: 6,000…`.
- Type `/tokens` for the totals since the mod loaded: requests, input, output, cache read and cache write.

Checking is free. The mod never calls a model. `/tokens` runs with no Claude turn and prints a log line that Claude doesn't read.

Made for the CorporateChittyChat Short "Do Claude Code Mods Eat Your Tokens?".

## Before you run it

A mod runs with your own permissions. Read `hooks/register.js` first. It's 66 lines. Then check what it does without running it:

```
claude plugin validate ./token-meter
```

The `calls:` line should list only `$.command.register`, `$.ui.invalidate` and `$.ui.log`. That means no file access, no network and no model calls.

## Run it

Mods need Claude Code v2.1.287 or later. Check your version with `claude --version`.

```
claude --plugin-dir ./token-meter
```

Ask Claude anything and watch the spinner. When it's done, type `/tokens`.

## Test it

The tests need no session, sign-in or network:

```
cd token-meter
claude plugin test
```

## What the numbers mean

The counts come from the token usage the Claude API reports for each request. They include subagents' requests, and they reset when the mod reloads. These are not billing figures. For your actual usage, check your plan or the Claude Console.

Tested with Claude Code 2.1.296. Mods are new, and their events can change between releases.

Docs: https://code.claude.com/docs/en/plugins/mods/overview
