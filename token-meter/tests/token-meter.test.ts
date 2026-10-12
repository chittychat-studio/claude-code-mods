import { expect, test } from 'claude-code/testing'

// One fake request to the model that reports these token counts
const USAGE = { input_tokens: 1200, output_tokens: 300, cache_read_input_tokens: 4000, cache_creation_input_tokens: 500 }

async function runStep($: any, index: number) {
  const stream = $.turn.step({ turnId: 't1', index, model: 'claude-test', messageCount: 1 })
  let step = await stream.next()
  while (step.done !== true) step = await stream.next()
  return step.value
}

test('session.start registers /tokens', async ($, on) => {
  const names: string[] = []
  on('session.start', () => ({ cwd: '/work' }))
  on('command.register', ($, e) => { names.push(e.name); return { value: undefined } })
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  expect(names).toEqual(['tokens'])
})

test('/tokens logs the totals and gives Claude nothing to read', async ($, on) => {
  const logs: string[] = []
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.step', async function* ($, e) {
    yield { kind: 'text', index: 0, text: 'ok' }
    return { turnId: e.turnId, index: e.index, answer: 'ok', toolUses: [], stopReason: 'end_turn', usage: USAGE }
  })
  on('ui.log', ($, e) => { logs.push(e.text); return { value: undefined } })

  await $.turn.start({ turnId: 't1' })
  const result = await runStep($, 0)
  await runStep($, 1)
  // The mod passes the model's result through unchanged
  expect(result.usage).toEqual(USAGE)

  const answer = await $.command.run({ command: 'tokens', args: '' })
  expect(answer).toEqual({})
  expect(logs).toEqual(['2 requests · in 2,400 · out 600 · cache read 8,000 · cache write 1,000'])
})

test('the spinner shows this turn\'s tokens', async ($, on) => {
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.step', async function* ($, e) {
    yield { kind: 'text', index: 0, text: 'ok' }
    return { turnId: e.turnId, index: e.index, answer: 'ok', toolUses: [], stopReason: 'end_turn', usage: USAGE }
  })
  let suffix = ''
  on('ui.render', ($, e) => { suffix = e.props.suffix; return { type: 'Text', props: {}, children: ['spinner'] } })

  await $.turn.start({ turnId: 't1' })
  await runStep($, 0)
  const ui = await $.ui.mount({ plugin: 'token-meter', component: 'Spinner', requestId: 'main', surface: 'terminal',
    viewport: { columns: 100, rows: 30 }, props: { word: 'Thinking', message: '', suffix: '', mode: 'normal' } })
  expect(suffix).toBe(' · tokens: 6,000…')
  await ui.unmount()
})

test('a request with no usage changes nothing', async ($, on) => {
  const logs: string[] = []
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.step', async function* ($, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn', usage: null }
  })
  on('ui.log', ($, e) => { logs.push(e.text); return { value: undefined } })
  await $.turn.start({ turnId: 't1' })
  await runStep($, 0)
  await $.command.run({ command: 'tokens', args: '' })
  expect(logs).toEqual(['0 requests · in 0 · out 0 · cache read 0 · cache write 0'])
})
