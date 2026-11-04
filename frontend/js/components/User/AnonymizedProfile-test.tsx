import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import MockProviders, { enableFeatureFlags } from '~/testUtils'
import { UserLink } from './UserLink'
import { UserAvatarRender } from './UserAvatar'
import { initialState as defaultInitialState } from '~/redux/modules/default'

/**
 * @jest-status compliant
 * @jest-reason Checks public DOM links and avatar images with profile links enabled, without a simulated GraphQL contract.
 */
describe('Anonymized author presentation', () => {
  let container: HTMLDivElement
  let root: Root
  const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  let originalActEnvironment: boolean | undefined
  const featureFlagMock = (globalThis as typeof globalThis & { mockFeatureFlag: jest.Mock }).mockFeatureFlag
  let originalFeatureFlagImplementation: ReturnType<typeof featureFlagMock.getMockImplementation>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    root = createRoot(container)
    originalFeatureFlagImplementation = featureFlagMock.getMockImplementation()
    enableFeatureFlags(['profiles'])
  })

  afterEach(() => {
    try {
      act(() => root.unmount())
    } finally {
      container.remove()
      featureFlagMock.mockImplementation(originalFeatureFlagImplementation)
      if (originalActEnvironment === undefined) {
        delete reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
      } else {
        reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
      }
    }
  })

  test.each(['Profil anonymisé', 'Anonymized profile', 'Anonymisiertes Profil'])(
    'shows a neutral avatar and no profile link for %s',
    username => {
      act(() => {
        root.render(
          <MockProviders
            useCapUIProvider
            store={{
              default: {
                ...defaultInitialState,
                images: { ...defaultInitialState.images, avatar: '/custom-platform-avatar.jpg' },
              },
            }}
          >
            <UserLink toggled user={{ displayName: username, url: '' }} />
            <UserAvatarRender
              user={{
                username,
                avatarUrl: '/svg/anonymized-profile.svg',
                url: '',
                ' $fragmentType': 'UserAvatar_user',
              }}
            />
          </MockProviders>,
        )
      })

      expect(container.textContent).toContain(username)
      expect(container.querySelectorAll('a')).toHaveLength(0)
      expect(container.querySelector('img')?.getAttribute('src')).toBe('/svg/anonymized-profile.svg')
    },
  )

  it('keeps the profile link and photo for an active author', () => {
    act(() => {
      root.render(
        <MockProviders useCapUIProvider>
          <UserLink toggled user={{ displayName: 'Alice', url: '/profile/alice' }} />
          <UserAvatarRender
            user={{
              username: 'Alice',
              avatarUrl: '/alice.jpg',
              url: '/profile/alice',
              ' $fragmentType': 'UserAvatar_user',
            }}
          />
        </MockProviders>,
      )
    })

    const links = Array.from(container.querySelectorAll('a'))
    expect(links).toHaveLength(2)
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/profile/alice', '/profile/alice'])
    expect(container.textContent).toContain('Alice')
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/alice.jpg')
  })
})
