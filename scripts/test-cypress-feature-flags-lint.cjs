const { RuleTester } = require('eslint')
const setupRule = require('../cypress/eslint-rules/feature-flags-setup')

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: 'module' } })
const setupImport = "import { setupFeatureFlags } from '../../../support/setupFeatureFlags';"

tester.run('feature-flags-setup', setupRule, {
  valid: [
    `${setupImport} describe('parent', () => { setupFeatureFlags({ calendar: false }); describe('child', () => { setupFeatureFlags({ calendar: true }); }); });`,
    "describe('suite', () => { it('changes flags', () => cy.setFeatureFlags({ calendar: true })); });",
    `${setupImport} describe('suite', () => { setupFeatureFlags({ calendar: true, captcha: false }); beforeEach(() => cy.task('db:restore')); });`,
    `${setupImport} describe('suite', () => { setupFeatureFlags(); it('changes a flag', () => cy.task('enable:feature', 'calendar')); });`,
    "import { setupFeatureFlags as flags } from '../../../support/setupFeatureFlags'; describe('suite', () => { flags({ calendar: false }); });",
  ].map(code => ({ code, filename: 'example.cy.ts' })),
  invalid: [
    {
      code: "describe('suite', () => { before(() => cy.setFeatureFlags({ calendar: true })); });",
      errors: [{ message: /Declare hook feature flags/ }],
    },
    {
      code: "describe('suite', () => { beforeEach(() => cy.task('enable:feature', 'calendar')); });",
      errors: [{ message: /Declare hook feature flags/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { setupFeatureFlags({}); before(() => cy.task('enable:feature', 'calendar')); });`,
      errors: [{ message: /Declare hook feature flags/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { setupFeatureFlags({}); describe('child', () => { after(() => cy.disableFeatureFlag('calendar')); }); });`,
      errors: [{ message: /Declare hook feature flags/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { setupFeatureFlags({ calendar: 'false' }); });`,
      errors: [{ message: /boolean values/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { setupFeatureFlags(['calendar']); });`,
      errors: [{ message: /object of boolean literals/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { before(() => setupFeatureFlags({})); });`,
      errors: [{ message: /directly in the describe/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { beforeEach(() => {}); setupFeatureFlags({}); });`,
      errors: [{ message: /before other hooks/ }],
    },
    {
      code: `${setupImport} describe('suite', () => { setupFeatureFlags({}); setupFeatureFlags({}); });`,
      errors: [{ message: /only once/ }],
    },
  ].map(test => ({ ...test, filename: 'example.cy.ts' })),
})

console.log('Cypress feature flag lint regression checks passed.')
