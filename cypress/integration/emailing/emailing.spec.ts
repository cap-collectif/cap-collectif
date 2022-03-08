import { EmailingCampaignPage } from '~e2e-pages/index'

describe('Emailing Campaign', () => {
  describe('Create Emailing BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('enable:feature', 'beta__emailing')
      cy.task('enable:feature', 'beta__emailing_parameters')
      cy.directLoginAs('super_admin')
    })
    it('should super admin want to create a mailing campaign', () => {
      cy.interceptGraphQLOperation({ operationName: 'EmailingCampaignPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreateEmailingCampaignMutation' })
      cy.interceptGraphQLOperation({ operationName: 'MailParameterQueryQuery' })
      cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateEmailingCampaignMutation' })
      EmailingCampaignPage.visit()
      cy.wait('@EmailingCampaignPageQuery')
      EmailingCampaignPage.closeModal()
      EmailingCampaignPage.createNewEmail()
      cy.wait('@CreateEmailingCampaignMutation')
      cy.wait('@MailParameterQueryQuery')
      cy.wait('@AdminRightNavbarAppQuery')
      cy.get('#title').click().type('{selectall} test')
      cy.get('body').type('{enter}')
      cy.assertReactSelectOptionCount('#senderEmail', 1)
      cy.selectReactSetOption('#senderEmail', 'dev@cap-collectif.com')
      cy.assertReactSelectOptionCount('#mailingList', 1)
      cy.selectReactSetOption('#mailingList', 'Agent de la ville')
      cy.wait('@UpdateEmailingCampaignMutation')
      cy.get('#global-alert-box').should('contain', 'label.draft.saved')
    })
  })
})
