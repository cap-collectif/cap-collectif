import React from 'react'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { translateContent } from './contentTranslator'

/**
 * @jest-status compliant
 * @jest-reason Checks that the anonymous identity follows the supplied locale catalog.
 */
describe('Anonymized profile labels', () => {
  test.each([
    ['fr-FR', 'Profil anonymisé', 'Utilisateur supprimé'],
    ['en-GB', 'Anonymized profile', 'Deleted user'],
  ])('uses the %s catalog without changing the legacy label', (locale, label, legacyLabel) => {
    render(
      React.createElement(
        IntlProvider,
        { locale, messages: { 'global.user.anonymized': label, 'deleted-user': legacyLabel } },
        React.createElement(
          React.Fragment,
          null,
          React.createElement('span', null, translateContent('global.user.anonymized')),
          React.createElement('span', null, translateContent('deleted-user')),
        ),
      ),
    )

    expect(screen.getByText(label).textContent).toBe(label)
    expect(screen.getByText(legacyLabel).textContent).toBe(legacyLabel)
  })

  it('keeps active author names', () => {
    render(React.createElement(IntlProvider, { locale: 'fr-FR', messages: {} }, translateContent('Alice')))

    expect(screen.getByText('Alice').textContent).toBe('Alice')
  })
})
