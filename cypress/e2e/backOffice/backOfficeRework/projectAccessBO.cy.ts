import { AdminGroupsPage } from '~e2e/pages'

const PROJECT_GROUP_2_ID = 'UHJvamVjdDpwcm9qZWN0R3JvdXAy'

const openAccessAccordion = () => {
  cy.get('#access').within(() => {
    cy.get('.cap-accordion__button').click({ force: true })
  })
}

describe('Project access back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'unstable__new_create_project')
    cy.directLoginAs('super_admin')
  })

  it('keeps project access editable after a protected group deletion is refused', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })

    AdminGroupsPage.visitGroupsList()
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(1)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Agent de la ville')
        AdminGroupsPage.getRowCellByColumnIndex(3)
          .find('button')
          .should('have.attr', 'aria-label', 'global.delete')
          .click()
      })

    cy.wait(300)
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation')
    AdminGroupsPage.checkToast('admin.group.delete.last-restricted-viewer-group')
    cy.get('.cap-table__tbody').should('contain', 'Agent de la ville')

    cy.interceptGraphQLOperation({ operationName: 'ProjectIdQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateNewProjectMutation' })
    cy.interceptGraphQLOperation({ operationName: 'GroupListFieldQuery' })

    cy.visit(`/admin-next/project/${PROJECT_GROUP_2_ID}`)
    cy.wait('@ProjectIdQuery')
    cy.wait('@ProjectConfigFormQuery')

    openAccessAccordion()
    cy.get('#visibility_choice-CUSTOM').should('be.checked')
    cy.get('#restrictedViewerGroups').should('contain', 'Agent de la ville')

    cy.get('#visibility_choice-PUBLIC').check({ force: true })
    cy.wait('@UpdateNewProjectMutation')
      .its('response.body.data.updateNewProject.errorCode')
      .should('eq', null)

    cy.reload()
    cy.wait('@ProjectIdQuery')
    cy.wait('@ProjectConfigFormQuery')
    openAccessAccordion()
    cy.get('#visibility_choice-PUBLIC').should('be.checked')
    cy.get('#restrictedViewerGroups').should('not.exist')

    cy.get('#visibility_choice-CUSTOM').check({ force: true })
    cy.openDSSelect('#restrictedViewerGroups', true)
    cy.contains('.cap-async-select__option', 'Utilisateurs').click({ force: true })
    cy.wait('@UpdateNewProjectMutation')
      .its('response.body.data.updateNewProject.errorCode')
      .should('eq', null)

    cy.reload()
    cy.wait('@ProjectIdQuery')
    cy.wait('@ProjectConfigFormQuery')
    openAccessAccordion()
    cy.get('#visibility_choice-CUSTOM').should('be.checked')
    cy.get('#restrictedViewerGroups').should('contain', 'Utilisateurs')
  })

  it('restores the last restricted viewer group immediately after a rejected removal', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProjectIdQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateNewProjectMutation' })

    cy.visit(`/admin-next/project/${PROJECT_GROUP_2_ID}`)
    cy.wait('@ProjectIdQuery')
    cy.wait('@ProjectConfigFormQuery')

    openAccessAccordion()
    cy.get('#visibility_choice-CUSTOM').should('be.checked')
    cy.get('#restrictedViewerGroups').should('contain', 'Agent de la ville')

    cy.get('#restrictedViewerGroups')
      .find('button[aria-label="Remove Agent de la ville"]')
      .click({ force: true })

    cy.wait('@UpdateNewProjectMutation')
      .its('response.body.data.updateNewProject.errorCode')
      .should('eq', 'NO_GROUP_WHEN_MANDATORY')

    AdminGroupsPage.checkToast('admin.group.delete.last-restricted-viewer-group')
    cy.get('#restrictedViewerGroups').should('contain', 'Agent de la ville')
    cy.get('#visibility_choice-CUSTOM').should('be.checked')
  })
})
