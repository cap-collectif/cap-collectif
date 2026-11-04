import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { IntlProvider } from 'react-intl'
import { DeleteAccountModal } from './DeleteAccountModal'

/**
 * @jest-status compliant
 * @jest-reason Checks both deletion previews and the hidden modal in the DOM, using real translations and portals.
 */
describe('Account deletion previews', () => {
  let container: HTMLDivElement
  let root: Root
  const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  let originalActEnvironment: boolean | undefined
  const viewer = {
    id: 'userAdmin',
    contributionsCount: 20,
    votes: { totalCount: 10 },
    ' $fragmentType': 'DeleteAccountModal_viewer' as const,
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    root = createRoot(container)
  })

  afterEach(() => {
    try {
      act(() => root.unmount())
    } finally {
      container.remove()
      if (originalActEnvironment === undefined) delete reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
      else reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
    }
  })

  test.each([
    ['fr', 'Profil anonymisé'],
    ['en', 'Anonymized profile'],
  ])('shows the neutral avatar and localized label for both options in %s', (locale, label) => {
    act(() =>
      root.render(
        <IntlProvider locale={locale} messages={{ 'global.user.anonymized': label }}>
          <DeleteAccountModal show viewer={viewer} handleClose={jest.fn()} />
        </IntlProvider>,
      ),
    )
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent?.split(label)).toHaveLength(3)
    const images = Array.from(dialog?.querySelectorAll('img') ?? [])
    expect(images).toHaveLength(2)
    images.forEach(image => expect(image.getAttribute('src')).toBe('/svg/anonymized-profile.svg'))
  })

  it('does not show a dialog when closed', () => {
    act(() =>
      root.render(
        <IntlProvider locale="fr">
          <DeleteAccountModal show={false} viewer={viewer} handleClose={jest.fn()} />
        </IntlProvider>,
      ),
    )
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
})
