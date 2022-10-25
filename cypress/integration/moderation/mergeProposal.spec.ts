import { AdminModerationPage } from '~e2e-pages/index'

describe('User Admin', () => {
  describe('Merge proposals', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('Logged in admin wants create a proposal from a merge of 2 proposals', () => {
      AdminModerationPage.visitProposalList()
      cy.wait(1000)
      AdminModerationPage.clickButtonFusion()
      AdminModerationPage.fillProposalMergeForm('UHJvamVjdDpwcm9qZWN0Nw')
      AdminModerationPage.clickSubmitButton()
      cy.wait(3000)
    })
  })
})
