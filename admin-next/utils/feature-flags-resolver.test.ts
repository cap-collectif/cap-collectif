import { decodePHPFlag } from './feature-flags-resolver'

it('can decode the PHP feature flag', () => {
  const encodedEnableFlag = `O:23:\"Qandidate\\Toggle\\Toggle\":4:{s:29:\"\u0000Qandidate\\Toggle\\Toggle\u0000name\";s:11:\"multilangue\";s:35:\"\u0000Qandidate\\Toggle\\Toggle\u0000conditions\";a:0:{}s:31:\"\u0000Qandidate\\Toggle\\Toggle\u0000status\";i:2;s:33:\"\u0000Qandidate\\Toggle\\Toggle\u0000strategy\";i:0;}`
  expect(decodePHPFlag(encodedEnableFlag)).toBe(true)

  const encodedDisabledFlag = `O:23:\"Qandidate\\Toggle\\Toggle\":4:{s:29:\"\u0000Qandidate\\Toggle\\Toggle\u0000name\";s:11:\"multilangue\";s:35:\"\u0000Qandidate\\Toggle\\Toggle\u0000conditions\";a:0:{}s:31:\"\u0000Qandidate\\Toggle\\Toggle\u0000status\";i:4;s:33:\"\u0000Qandidate\\Toggle\\Toggle\u0000strategy\";i:0;}`
  expect(decodePHPFlag(encodedDisabledFlag)).toBe(false)
})
