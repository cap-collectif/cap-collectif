import { Base } from '~e2e-pages/index'

// ------------------------ CREATE CONSULTATION AS ADMIN ------------------------
context('Create a consultation as admin', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('creates a consultation as admin', () => {
    cy.directLoginAs('admin')
    cy.visit('/admin/capco/app/consultation/create')
    cy.get("[type='text']").type('My consultation')
    cy.get("button[name='btn_create_and_edit']").click({ force: true })
    cy.contains('success.creation.flash {"name":"My consultation"}')
  })
})

const adminOpinionTypePagePath = '/admin/capco/app/opiniontype/opinionType13/edit'
const adminSectionsListPagePath = '/admin/capco/app/section/list'
const adminSectionPagePath = '/admin/capco/app/section/sectionMetrics/edit'

// ------------------------ LOGGED IN AS ADMIN ------------------------
context('Logged in as ADMIN, should see some elements and not see others', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should NOT see comment type', () => {
    cy.directLoginAs('admin')
    Base.visit({ path: adminOpinionTypePagePath, operationName: 'AdminRightNavbarAppQuery' })
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.get('#commentSystem').should('not.exist')
    cy.scrollTo('bottom')
    cy.get('#commentSystem').should('not.exist')
  })

  it('can see section list without error', () => {
    cy.directLoginAs('admin')
    Base.visit({ path: adminSectionsListPagePath, operationName: 'AdminRightNavbarAppQuery' })

    cy.contains('error.500').should('not.exist')
    cy.contains('section_list').should('be.visible')
  })

  it('can edit a section without error', () => {
    cy.directLoginAs('admin')
    Base.visit({ path: adminSectionPagePath, operationName: 'AdminRightNavbarAppQuery' })
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.contains('error.500').should('not.exist')
    cy.contains('error.404').should('not.exist')
    cy.get('.content').should('exist')
  })

  it('should NOT see voting type of a contribution', () => {
    cy.directLoginAs('admin')
    Base.visit({ path: adminOpinionTypePagePath, operationName: 'AdminRightNavbarAppQuery' })
    cy.get('#voteWidgetType').should('not.exist')
    cy.scrollTo('bottom')
    cy.get('#voteWidgetType').should('not.exist')
  })
})

// ------------------------ LOGGED IN AS SUPER ADMIN ------------------------
context('Logged in as SUPER ADMIN, should see more elements than as ADMIN', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('Super Admin should see comment type', () => {
    cy.directLoginAs('super_admin')
    Base.visit({ path: adminOpinionTypePagePath, operationName: 'AdminRightNavbarAppQuery' })
    cy.get('#commentSystem').should('exist').and('be.visible')
  })

  it('Super Admin should see voting type of a contribution', () => {
    cy.directLoginAs('super_admin')
    Base.visit({ path: adminOpinionTypePagePath, operationName: 'AdminRightNavbarAppQuery' })
    cy.get('#voteWidgetType').should('be.visible')
  })
})
