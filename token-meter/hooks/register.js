// token-meter: watch where your tokens go, live.
// The mod itself never calls a model, and /tokens prints with $.ui.log,
// a transcript line that Claude doesn't read, so checking costs no tokens.

// Totals since the mod loaded, shared by the hooks below
let requests = 0
let input = 0
let output = 0
let cacheRead = 0
let cacheWrite = 0
// Tokens used by the turn that's running now
let thisTurn = 0

function fmt(n) {
  return n.toLocaleString('en-US')
}

// Claude Code calls this once when the mod loads
export function register(on) {
  // Runs when the session starts: add the /tokens command
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tokens',
      description: 'Show the tokens used since token-meter loaded',
    })
    return next(e)
  })

  // A new turn starts: reset the per-turn count
  on('turn.start', async ($, e, next) => {
    thisTurn = 0
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // Each request to the model: let it stream, then read its token usage
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    const u = result && result.usage
    if (u) {
      requests += 1
      input += u.input_tokens || 0
      output += u.output_tokens || 0
      cacheRead += u.cache_read_input_tokens || 0
      cacheWrite += u.cache_creation_input_tokens || 0
      thisTurn += (u.input_tokens || 0) + (u.output_tokens || 0) +
        (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
      $.ui.invalidate('ui.render')
    }
    return result
  })

  // Each time the spinner is drawn: add this turn's count after its word
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    return next({ ...e, props: { ...e.props, suffix: ' · tokens: ' + fmt(thisTurn) + '…' } })
  })

  // /tokens: print the totals as a log line Claude doesn't read, and return nothing
  on('command.run', { command: 'tokens' }, async ($) => {
    $.ui.log(
      fmt(requests) + ' requests · in ' + fmt(input) + ' · out ' + fmt(output) +
      ' · cache read ' + fmt(cacheRead) + ' · cache write ' + fmt(cacheWrite)
    )
    return {}
  })
}
