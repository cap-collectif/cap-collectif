import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status compliant
 */
describe('Dynamic sitemap', () => {
  setupFeatureFlags({ shield_mode: false, captcha: false, multilangue: true })
  let createdMenuItemId: string | undefined

  before(() => {
    cy.task('db:restore')
  })

  afterEach(() => {
    if (createdMenuItemId) {
      cy.directLoginAs('admin')
      cy.request('POST', '/graphql/internal', {
        query: `mutation ($input: DeleteMenuItemInput!) {
          deleteMenuItem(input: $input) { deletedMenuItemId errorCode }
        }`,
        variables: { input: { id: createdMenuItemId } },
      })
        .its('body.data.deleteMenuItem')
        .should('deep.equal', { deletedMenuItemId: createdMenuItemId, errorCode: null })
        .then(() => {
          createdMenuItemId = undefined
        })
      cy.visit('/en/sitemap')
      cy.contains('#sitemap-page .sitemap-category-title a', 'Test category').should('not.exist')
    }
  })

  it('underlines linked menu categories', () => {
    cy.visit('/en/sitemap')
    cy.contains('#sitemap-page .sitemap-category-title a', 'Test category').should('not.exist')
    cy.directLoginAs('admin')
    cy.request('POST', '/graphql/internal', {
      query: `mutation ($input: CreateMenuItemInput!) {
        createMenuItem(input: $input) { menuItem { id } errorCode }
      }`,
      variables: {
        input: {
          menu: 'HEADER',
          position: 1,
          isEnabled: true,
          isExternalLink: true,
          translations: [
            { locale: 'FR_FR', title: 'Rubrique de recette', link: 'https://example.com' },
            { locale: 'EN_GB', title: 'Test category', link: 'https://example.com' },
          ],
        },
      },
    })
      .its('body.data.createMenuItem')
      .should('include', { errorCode: null })
      .its('menuItem.id')
      .should('be.a', 'string')
      .then(id => {
        createdMenuItemId = id
      })

    cy.visit('/en/sitemap')
    cy.contains('#sitemap-page .sitemap-category-title a', 'Test category')
      .should('have.attr', 'href', 'https://example.com')
      .and('have.css', 'text-decoration-line', 'underline')
  })

  it('renders the sitemap and exposes its footer link', () => {
    cy.request({ url: '/en/sitemap', failOnStatusCode: false }).as('sitemapResponse')
    cy.get('@sitemapResponse').its('status').should('eq', 200)
    cy.get('@sitemapResponse').its('headers.cache-control').should('include', 'no-store')
    cy.visit('/en/sitemap')

    cy.get('#sitemap-page').should('be.visible')
    cy.get('#sitemap-page h1').should('have.text', 'sitemap.title')
    cy.get('#sitemap-page nav[aria-label="navbar.breadcrumb"]').should('exist')
    cy.get('#sitemap-page nav[aria-label="navbar.breadcrumb"] ol > li').should('have.length', 2)
    cy.get('#sitemap-page a').each($link => {
      assert.isNotEmpty($link.text().trim())
    })
    cy.get('#sitemap-page').should('contain.text', 'navbar.homepage')
    cy.get('#sitemap-page').should('contain.text', 'global.participative.project')
    cy.get('#sitemap-page .sitemap-home-link-wrapper a[href="/en/"]').should('have.length', 1)
    cy.get('#sitemap-page .sitemap-tree > .sitemap-tree-item > h3 a[href="/en/"]').should('not.exist')

    cy.get('#sitemap-page .sitemap-project-title a').should('not.contain.text', 'Le P16 un projet à base de riz')
    cy.get('#sitemap-page .sitemap-project-title a').should('not.contain.text', 'Projet Archivé')
    cy.get('#sitemap-page .sitemap-project-title a').should(
      'not.contain.text',
      'Transformation numérique des relations',
    )
    cy.get('#sitemap-page .sitemap-project-title a').should('contain.text', 'Croissance, innovation, disruption')
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains('Croissance, innovation, disruption')
      .closest('.sitemap-tree-child')
      .within(() => {
        cy.contains('a', 'Collecte des avis').should('exist')
      })
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains('Projet avec une étape de participation en continue')
      .closest('.sitemap-tree-child')
      .within(() => {
        cy.contains('a', 'Collecte avec vote simple limité').should('exist')
      })
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains('Dépôt avec selection vote simple')
      .closest('.sitemap-tree-child')
      .within(() => {
        cy.contains('a', 'Dépôt fermé').should('exist')
        cy.contains('a', 'Sélection avec vote simple').should('exist')
      })
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains('Budget Participatif Rennes')
      .closest('.sitemap-tree-child')
      .within(() => {
        cy.contains('a', 'Sélection à venir').should('exist')
      })
    cy.get('#sitemap-page .sitemap-project-title a').should('contain.text', "Débat sur l'Oculus Quest")
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains("Débat sur l'Oculus Quest")
      .closest('.sitemap-tree-child')
      .within(() => {
        cy.contains(
          'a',
          'Une entreprise doit-elle offrir un oculus quest 2 à tous les salariés pour le confinement ?',
        ).should('exist')
      })
    cy.get('#sitemap-page .sitemap-project-title a').should('contain.text', 'Débats sur la vie')
    cy.get('#sitemap-page .sitemap-project-title a')
      .contains('Débats sur la vie')
      .closest('.sitemap-tree-child')
      .find('.sitemap-tree-children')
      .should('not.exist')
    cy.get('#main_navbar').should('be.visible')
    cy.get('footer').should('be.visible')
    cy.get('a[href="#main"]').should('exist')
    cy.get('main#main #sitemap-page').should('exist')
    cy.get('main#main').should('have.attr', 'tabindex', '-1')
    cy.get('footer .footer-links a[href$="/en/sitemap"]').should('have.length', 1)
    cy.get('.sitemap-footer-section a[href$="/en/sitemap"]')
      .should('have.length', 1)
      .should('have.attr', 'aria-current', 'page')
      .next('.sitemap-current-page')
      .should('have.text', 'sitemap.current-page')
  })

  it('keeps the global navigation and footer on other pages', () => {
    cy.visit('/contact')
    cy.get('#main_navbar').should('be.visible')
    cy.get('footer').should('exist')
  })

  it('orders sitemap projects by most recent publication date', () => {
    return cy
      .request('POST', '/graphql/internal', {
        query: `query SitemapProjectOrder {
        sitemap { projects { url } }
        projects(first: 100, archived: ACTIVE, onlyPublic: true, orderBy: { field: PUBLISHED_AT, direction: DESC }) {
          edges { node { slug publishedAt } }
        }
      }`,
      })
      .then(({ body }) => {
        assert.isUndefined(body.errors)
        const datesBySlug = new Map<string, number>(
          body.data.projects.edges.map(({ node }) => [node.slug, Date.parse(node.publishedAt)]),
        )
        const dates: number[] = body.data.sitemap.projects
          .map(({ url }) => datesBySlug.get(decodeURIComponent(new URL(url).pathname.split('/').pop())))
          .filter((date): date is number => date !== undefined)

        assert.isAbove(new Set(dates).size, 1, 'matched publication dates')
        assert.isTrue(dates.every(Number.isFinite), 'valid publication dates')
        assert.deepEqual(
          dates,
          [...dates].sort((a, b) => b - a),
        )
      })
  })

  it('returns a 404 for a localized sitemap when multilingual is disabled', () => {
    cy.setFeatureFlags({ multilangue: false })
    cy.request({ url: '/en/sitemap', failOnStatusCode: false }).its('status').should('eq', 404)
  })

  it('uses the default language when the language cookie is not published', () => {
    cy.request({ url: '/ur/sitemap', failOnStatusCode: false }).its('status').should('eq', 404)
    cy.setCookie('locale', 'ur-IN')
    cy.visit('/sitemap')
    cy.get('#main_navbar').should('be.visible')
    cy.get('footer').should('be.visible')
    cy.get('#sitemap-page .sitemap-home-link-wrapper a').should('have.attr', 'href', '/')
    cy.get('#sitemap-page a[href^="/ur/"]').should('not.exist')
  })

  it('uses the default language when multilingual is disabled despite a language cookie', () => {
    cy.setFeatureFlags({ multilangue: false })
    cy.setCookie('locale', 'en-GB')
    cy.visit('/sitemap')
    cy.get('#sitemap-page .sitemap-home-link-wrapper a').should('have.attr', 'href', '/')
    cy.get('#sitemap-page a[href^="/en/"]').should('not.exist')
  })

  it('prefers the published language in the URL over an unpublished language cookie', () => {
    cy.setCookie('locale', 'ur-IN')
    cy.intercept('POST', '**/graphql/internal?operation=SitemapQuery').as('sitemapQuery')
    cy.visit('/en/sitemap')
    cy.wait('@sitemapQuery').its('response.body.data.sitemap.homeUrl').should('eq', '/en/')
    cy.get('html').should('have.attr', 'lang', 'en')
    cy.get('#sitemap-page .sitemap-home-link-wrapper a').should('have.attr', 'href', '/en/')
    cy.get('#sitemap-page a[href^="/ur/"]').should('not.exist')
  })

  it('does not expose sitemap data to anonymous visitors in shield mode', () => {
    cy.setFeatureFlags({ shield_mode: true })
    cy.request('POST', '/graphql/internal', { query: '{ sitemap { homeUrl } }' })
      .its('body')
      .should('have.property', 'errors')
      .and('not.be.empty')
  })
})
