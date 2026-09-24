describe('Video Admin Page', () => {
  const visitVideosPage = () => {
    cy.visit('/admin-next/videos', { failOnStatusCode: false })
  }

  const rowFor = (title: string) => cy.contains(title).closest('tr')

  beforeEach(() => {
    cy.task('db:restore')
    cy.enableFeatureFlag('unstable__sonata_migration_to_admin_next')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    visitVideosPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('creates a video', () => {
    const title = 'My awesome new video'

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'videos_Query' })
    visitVideosPage()
    cy.wait('@videos_Query')

    cy.contains('button', 'admin.videos.create').click()
    cy.get('#FR_FR-title').filter(':visible').clear().type(title, { delay: 0 })
    cy.get('#link').filter(':visible').clear().type('https://www.youtube.com/embed/gwuLVLwMjuA', { delay: 0 })

    cy.interceptGraphQLOperation({ operationName: 'CreateVideoMutation' })
    cy.contains('button', 'btn_create').filter(':visible').click()
    // GraphQL answers 200 even on failure, so assert on the payload rather than the HTTP status.
    cy.wait('@CreateVideoMutation').its('response.body.data.createVideo.errorCode').should('eq', null)

    cy.interceptGraphQLOperation({ operationName: 'videos_Query' })
    visitVideosPage()
    cy.wait('@videos_Query')
    rowFor(title).within(() => {
      cy.contains('global.yes').should('be.visible')
    })
  })

  it('updates a video', () => {
    const title = 'Non classé'
    const updatedTitle = `${title} updated`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'videos_Query' })
    visitVideosPage()
    cy.wait('@videos_Query')

    rowFor(title).contains('a', title).click()
    cy.get('#FR_FR-title').filter(':visible').should('have.value', title)

    cy.get('#FR_FR-title').filter(':visible').clear().type(updatedTitle, { delay: 0 })
    cy.get('.cap-switch__slider').click()

    cy.interceptGraphQLOperation({ operationName: 'UpdateVideoMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateVideoMutation').its('response.body.data.updateVideo.errorCode').should('eq', null)

    // Reload to confirm the changes were actually persisted, not just an optimistic UI update.
    cy.interceptGraphQLOperation({ operationName: 'videos_Query' })
    visitVideosPage()
    cy.wait('@videos_Query')
    rowFor(updatedTitle).within(() => {
      cy.contains('global.no').should('be.visible')
    })
  })

  it('deletes a video', () => {
    const title = 'Non classé'

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'videos_Query' })
    visitVideosPage()
    cy.wait('@videos_Query')

    rowFor(title).within(() => {
      cy.get('button[aria-label="global.delete"]').click()
    })
    cy.get('[data-cy="deletion-confirmation"]').click()
    cy.contains(title).should('not.exist')
  })
})
