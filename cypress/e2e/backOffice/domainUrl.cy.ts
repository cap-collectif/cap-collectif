describe('Domain URL back office', () => {
  const baseOrigin = 'https://capco.test'

  beforeEach(() => {
    cy.task('db:restore')
    cy.task('disable:feature', 'http_redirects')
    cy.task(
      'run:sql',
      'DELETE FROM http_redirect WHERE source_url IN ("/projects", "/manual-redirection-check", "/manual-short-check")',
    )
    cy.directLoginAs('super_admin')
  })

  const absoluteUrl = (path: string) => `${baseOrigin}${path}`
  const sourceInputUrl = (path: string) => `${baseOrigin}${path}`

  const seedHttpRedirect = (
    sourcePath: string,
    destinationUrl: string,
    duration: 'TEMPORARY' | 'PERMANENT',
    redirectType: 'URL_SHORTENING' | 'REDIRECTION',
  ) => {
    const escapedSourcePath = sourcePath.replace(/"/g, '\\"')
    const escapedDestinationUrl = destinationUrl.replace(/"/g, '\\"')

    cy.task(
      'run:sql',
      `DELETE
                        FROM http_redirect
                        WHERE source_url = "${escapedSourcePath}"`,
    )
    cy.task(
      'run:sql',
      `INSERT INTO http_redirect (id, source_url, destination_url, duration, redirect_type, created_at, updated_at)
       VALUES (UUID(), "${escapedSourcePath}", "${escapedDestinationUrl}", "${duration}", "${redirectType}", NOW(),
               NOW())`,
    )
  }

  const visitDomainUrlPage = () => {
    cy.visit('/admin-next/domain-url')
  }

  const fillVisibleField = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`).filter(':visible').clear().type(value, { delay: 0 })
  }

  const submitVisibleModal = (buttonLabel: 'global.add' | 'global.save') => {
    cy.contains('button', buttonLabel).filter(':visible').click()
  }

  const waitForSuccessToast = (messageId: string) => {
    cy.contains(messageId).should('be.visible')
  }

  const purgePublicCache = () => {
    cy.exec('curl -sS -XBAN http://capco.test:8181', {
      failOnNonZeroExit: false,
      log: false,
    })
  }

  const assertRedirectResponse = (sourcePath: string, statusCode: 301 | 302, destinationUrl: string) => {
    cy.request({
      url: sourcePath,
      followRedirect: false,
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(statusCode)
      expect(response.headers.location).to.eq(destinationUrl)
    })
  }

  it('creates and applies a shortened URL through the back office', () => {
    const shortSourcePath = `/cypress-short-url-${Date.now()}`
    const shortDestinationUrl = absoluteUrl('/projects')

    visitDomainUrlPage()
    cy.contains('button', 'admin.domain-url.url-management.shorten-url').click()
    fillVisibleField('longUrl', shortDestinationUrl)
    fillVisibleField('shortUrl', sourceInputUrl(shortSourcePath))
    submitVisibleModal('global.add')
    waitForSuccessToast('admin.domain-url.url-management.success-shorten')
    purgePublicCache()

    cy.contains(shortSourcePath)
    cy.contains(shortDestinationUrl)
    cy.contains('admin.domain-url.url-management.duration-temporary')

    assertRedirectResponse(shortSourcePath, 302, shortDestinationUrl)
  })

  it('creates and applies a classic redirect through the back office', () => {
    const redirectSourcePath = `/cypress-redirect-url-${Date.now()}`
    const redirectDestinationUrl = absoluteUrl('/blog')

    visitDomainUrlPage()
    cy.contains('button', 'admin.domain-url.url-management.add-redirect').click()
    fillVisibleField('originalUrl', sourceInputUrl(redirectSourcePath))
    fillVisibleField('destinationUrl', redirectDestinationUrl)
    submitVisibleModal('global.add')
    waitForSuccessToast('admin.domain-url.url-management.success-redirect')
    purgePublicCache()

    cy.contains(redirectSourcePath)
    cy.contains(redirectDestinationUrl)
    cy.contains('admin.domain-url.url-management.duration-permanent')

    assertRedirectResponse(redirectSourcePath, 301, redirectDestinationUrl)
  })

  it('edits an existing redirect and applies the updated destination and duration', () => {
    const sourcePath = `/cypress-edit-redirect-${Date.now()}`
    const initialDestinationUrl = absoluteUrl('/contact')
    const updatedDestinationUrl = absoluteUrl('/blog')

    seedHttpRedirect(sourcePath, initialDestinationUrl, 'PERMANENT', 'REDIRECTION')
    visitDomainUrlPage()

    cy.contains(sourcePath)
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    fillVisibleField('originalUrl', sourceInputUrl(sourcePath))
    fillVisibleField('destinationUrl', updatedDestinationUrl)
    cy.get('#redirect-duration-temporary').check({ force: true })
    submitVisibleModal('global.save')
    waitForSuccessToast('admin.domain-url.url-management.success-redirect')
    purgePublicCache()

    cy.contains(sourcePath)
      .closest('tr')
      .within(() => {
        cy.contains(updatedDestinationUrl)
        cy.contains('admin.domain-url.url-management.duration-temporary')
      })

    assertRedirectResponse(sourcePath, 302, updatedDestinationUrl)
  })

  it('deletes an existing redirect through the back office', () => {
    const sourcePath = `/cypress-delete-redirect-${Date.now()}`
    const destinationUrl = absoluteUrl('/contact')

    seedHttpRedirect(sourcePath, destinationUrl, 'PERMANENT', 'REDIRECTION')
    visitDomainUrlPage()

    cy.contains(sourcePath)
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.delete"]').click()
      })

    cy.contains('button', 'global.delete').filter(':visible').click()
    cy.contains(sourcePath).should('not.exist')
    purgePublicCache()

    cy.request({
      url: sourcePath,
      followRedirect: false,
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(404)
    })
  })

  it('prevents creating a redirect when the source URL already exists', () => {
    const sourcePath = `/cypress-duplicate-redirect-${Date.now()}`

    seedHttpRedirect(sourcePath, absoluteUrl('/contact'), 'PERMANENT', 'REDIRECTION')
    visitDomainUrlPage()

    cy.contains('button', 'admin.domain-url.url-management.add-redirect').click()
    fillVisibleField('originalUrl', sourceInputUrl(sourcePath))
    fillVisibleField('destinationUrl', absoluteUrl('/blog'))
    cy.get('#destinationUrl').filter(':visible').blur()

    cy.contains('button', 'global.add').filter(':visible').should('be.disabled')
  })

  it('prevents shortening a URL when the short source already exists', () => {
    const sourcePath = `/cypress-duplicate-short-${Date.now()}`

    seedHttpRedirect(sourcePath, absoluteUrl('/projects'), 'TEMPORARY', 'URL_SHORTENING')
    visitDomainUrlPage()

    cy.contains('button', 'admin.domain-url.url-management.shorten-url').click()
    fillVisibleField('longUrl', absoluteUrl('/blog'))
    fillVisibleField('shortUrl', sourceInputUrl(sourcePath))

    cy.contains('button', 'global.add').filter(':visible').should('be.disabled')
  })

  it('prioritizes a redirect over the existing /projects page', () => {
    const priorityDestinationUrl = absoluteUrl(`/cypress-priority-destination-${Date.now()}`)

    visitDomainUrlPage()
    cy.contains('button', 'admin.domain-url.url-management.add-redirect').click()
    fillVisibleField('originalUrl', sourceInputUrl('/projects'))
    fillVisibleField('destinationUrl', priorityDestinationUrl)
    submitVisibleModal('global.add')
    waitForSuccessToast('admin.domain-url.url-management.success-redirect')
    purgePublicCache()

    cy.contains('/projects')
    cy.contains(priorityDestinationUrl)

    assertRedirectResponse('/projects', 301, priorityDestinationUrl)
  })
})
