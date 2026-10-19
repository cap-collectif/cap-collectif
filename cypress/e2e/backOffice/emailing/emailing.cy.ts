import { EmailingCampaignPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

describe('Emailing Campaign - Create Emailing BO', () => {
  setupFeatureFlags({ emailing: true, emailing_parameters: true })

  beforeEach(() => {
    cy.task('db:restore')
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
    cy.get('.toasts-container--top div').should('contain', 'label.draft.saved')
  })
})
