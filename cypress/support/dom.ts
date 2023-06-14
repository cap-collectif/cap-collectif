/* eslint-disable @typescript-eslint/ban-ts-comment */
Cypress.Commands.add('confirmCaptcha', () => {
  cy.wait(1000)
  return cy.window().then(win => {
    const $recaptcha = win.document.querySelector("iframe[src*='recaptcha']")
    if ($recaptcha) {
      // @ts-ignore
      $recaptcha.contentDocument.getElementById('recaptcha-token').click()
    }
    const $captcha = win.document.querySelector("iframe[src*='turnstile']")
    if ($captcha) {
      // @ts-ignore
      $captcha.contentDocument.getElementById('challenge-stage').click()
      cy.get($captcha.contentDocument.getElementById('success')).should('be.visible')
    }
  })
})
Cypress.Commands.add('getByDataCy', (name: string) => {
  return cy.get(`[data-cy="${name}"]`)
})
