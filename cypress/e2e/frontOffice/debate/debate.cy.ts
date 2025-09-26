import { DebatePage } from '~e2e-pages/index'

describe('Debate', () => {
  it('should correctly show a debate', () => {
    DebatePage.visitCannabisDebate()
    cy.contains('Pour ou contre la légalisation du Cannabis ?').should('exist')
  })
})
