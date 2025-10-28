import { Base } from '~e2e-pages/index'

describe('Search Feature', () => {
  const searchUrl = '/search'
  const resultCountSelector = '.search__results-nb'

  beforeEach(() => {
    cy.task('enable:feature', 'search')
    Base.visit({ path: searchUrl, withIntercept: true, operationName: 'NavbarRightQuery' })
  })

  it('should allow anonymous user to search across all types', () => {
    cy.get(resultCountSelector).should('contain', '3632')

    cy.get('#search_term').type('article')
    cy.get('.btn[type="submit"]').click({ force: true })

    cy.wait('@NavbarRightQuery')
    cy.get(resultCountSelector).should('contain', '12')
  })

  it('should allow anonymous user to filter and sort search results', () => {
    cy.get('#search_term').type('coucou')
    cy.get('input[value=argument]').click({ force: true })

    cy.wait('@NavbarRightQuery')
    cy.get(resultCountSelector).should('contain', '3')

    cy.get('.search-result__preview').first().should('contain', 'Coucou, je suis un bel argument !')
    cy.get('.search-result__preview').eq(1).should('contain', 'Coucou, je suis un bel argument !')

    cy.get('#search_sort').select('date')

    cy.wait('@NavbarRightQuery')

    cy.get('.search-result__preview').first().should('contain', 'Coucou, je suis un bel argument !')
    cy.get('.search-result__preview').eq(1).should('contain', 'Coucou, je suis un bel argument !')
  })

  it('should allow anonymous user to search in members', () => {
    cy.get('#search_term').type('Masson')
    cy.get('input[value=user]').click({ force: true })

    cy.get(resultCountSelector).should('contain', '1')
    cy.get('.search-result__preview').should('contain', 'Masson')
  })
})
