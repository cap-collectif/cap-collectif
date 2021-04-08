/* eslint-disable @typescript-eslint/ban-ts-comment */
Cypress.Commands.add('confirmRecaptcha', () => {
  cy.wait(1000)
  return cy.window().then(win => {
    const $captcha = win.document.querySelector("iframe[src*='recaptcha']")
    if ($captcha) {
      // @ts-ignore
      $captcha.contentDocument.getElementById('recaptcha-token').click()
    }
  })
})
