const { RuleTester } = require('eslint')
const setupRule = require('../cypress/eslint-rules/feature-flags-setup')
const cleanupRule = require('../cypress/eslint-rules/feature-toggle-cleanup')

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: 'module' } })
const setupImport = "import { setupFeatureFlags } from '../../../support/setupFeatureFlags';"

tester.run('feature-flags-setup', setupRule, {
  valid: [
    `${setupImport} describe('suite', () => { setupFeatureFlags({ calendar: true, captcha: false }); beforeEach(() => cy.task('db:restore')); });`,
    `${setupImport} describe('suite', () => { setupFeatureFlags(); it('changes a flag', () => cy.task('enable:feature', 'calendar')); });`,
    "describe('legacy', () => { before(() => cy.task('enable:feature', 'calendar')); });",
    `${setupImport} describe('protected', () => { setupFeatureFlags({}); }); describe('legacy sibling', () => { before(() => cy.enableFeatureFlag('calendar')); });`,
    "import { setupFeatureFlags as flags } from '../../../support/setupFeatureFlags'; describe('suite', () => { flags({ calendar: false }); });",
  ],
  invalid: [
    {
      code: `${setupImport} describe('parent', () => { setupFeatureFlags({}); describe('child', () => { setupFeatureFlags({ calendar: true }); }); });`,
      errors: [{ message: /Nested suites inherit/ }],
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
  ],
})

tester.run('feature-toggle-cleanup', cleanupRule, {
  valid: [
    `${setupImport} describe('suite', () => { setupFeatureFlags({}); it('changes a flag', () => cy.task('enable:feature', 'calendar')); });`,
    "describe('legacy', () => { before(() => cy.task('enable:feature', 'calendar')); after(() => cy.task('disable:feature', 'calendar')); });",
  ],
  invalid: [
    {
      code: "describe('legacy', () => { before(() => cy.task('enable:feature', 'calendar')); });",
      errors: [{ message: /not disabled/ }],
    },
    {
      code: `${setupImport} describe('protected', () => { setupFeatureFlags({}); }); describe('legacy sibling', () => { before(() => cy.task('enable:feature', 'calendar')); });`,
      errors: [{ message: /not disabled/ }],
    },
  ],
})

console.log('Cypress feature flag lint regression checks passed.')
