import { Base } from '~e2e-pages/index'

describe('Search Feature', () => {
  const searchUrl = '/search'
  const resultCountSelector = '.search__results-nb'
  const searchInputSelector = 'input[type="text"]#search_term'
  const resultsListSelector = 'ul.search__results li'

  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'search')
  })
  beforeEach(() => {
    Base.visit({ path: searchUrl, operationName: 'NavbarRightQuery' })
  })

  it('should allow anonymous user to search across all types', () => {
    cy.get(resultCountSelector).should('contain', '3706')

    cy.get(searchInputSelector).type('article')
    cy.get('.btn[type="submit"]').click({ force: true })

    cy.wait('@NavbarRightQuery', { timeout: 10000 })
    cy.get(resultCountSelector).should('contain', '12')
  })

  it('should allow anonymous user to filter and sort search results', () => {
    cy.get(searchInputSelector).type('coucou')
    cy.get('input[value=argument]').click({ force: true })

    cy.wait('@NavbarRightQuery', { timeout: 10000 })
    cy.get(resultsListSelector).should('have.length', '3')

    cy.get('.search-result__preview').first().should('contain', 'Coucou, je suis un bel argument !')
    cy.get('.search-result__preview').eq(1).should('contain', 'Coucou, je suis un bel argument !')

    cy.get('#search_sort').select('date')

    cy.wait('@NavbarRightQuery', { timeout: 10000 })

    cy.get('.search-result__preview').first().should('contain', 'Coucou, je suis un bel argument !')
    cy.get('.search-result__preview').eq(1).should('contain', 'Coucou, je suis un bel argument !')
  })

  it('should allow anonymous user to search in members', () => {
    cy.get(searchInputSelector).type('Masson')
    cy.get('input[value=user]').click({ force: true })

    cy.get(resultsListSelector).should('have.length', '1')
    cy.get('.search-result__preview').should('contain', 'Masson')
  })
})
