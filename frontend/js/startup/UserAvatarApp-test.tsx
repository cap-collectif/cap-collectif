import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { RelayEnvironmentProvider } from 'react-relay'
import { createMockEnvironment } from 'relay-test-utils'
import MockProviders, { enableFeatureFlags } from '~/testUtils'
import { initialState } from '~/redux/modules/default'
import UserAvatarApp from './UserAvatarApp'

// Replace application bootstrap with the local Redux, theme and Relay providers below.
jest.mock('./Providers', () => ({
  __esModule: true,
  default: ({ children }) => children,
}))

/**
 * @jest-status compliant
 * @jest-reason Checks the avatar DOM through the real startup query and renderer, with Relay responses simulated at the network boundary.
 */
describe('Twig author avatars', () => {
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

  test.each([
    ['Organization', 'Collective', '/collective-logo.png', '/collective-logo.png'],
    ['Organization', 'Collective', null, '/platform-avatar.png'],
    ['User', 'Alice', '/alice.jpg', '/alice.jpg'],
    ['User', 'Profil anonymisé', '/svg/anonymized-profile.svg', '/svg/anonymized-profile.svg'],
    ['Participant', 'Profil anonymisé', '/svg/anonymized-profile.svg', '/svg/anonymized-profile.svg'],
    ['Missing author', null, null, '/platform-avatar.png'],
  ])('renders %s %s with avatar %s', async (type, username, avatarUrl, expectedSrc) => {
    const environment = createMockEnvironment()
    environment.mock.queueOperationResolver(() => ({
      data: {
        node: {
          __typename: type,
          __isNode: type,
          ...(type === 'Participant' ? {} : { __isAuthor: type }),
          ...(type === 'Organization' ? {} : { __isContributor: type }),
          id: 'author-id',
          username,
          avatarUrl,
          url: '/profile/author',
        },
      },
    }))

    await act(async () => {
      root.render(
        <MockProviders
          useCapUIProvider
          store={{ default: { ...initialState, images: { ...initialState.images, avatar: '/platform-avatar.png' } } }}
        >
          <RelayEnvironmentProvider environment={environment}>
            <UserAvatarApp userId={type === 'Missing author' ? null : 'author-id'} size="lg" />
          </RelayEnvironmentProvider>
        </MockProviders>,
      )
    })

    expect(container.querySelector('img')?.getAttribute('src')).toBe(expectedSrc)
    expect(container.querySelector('img')?.getAttribute('alt')).toBe(username ?? 'A')
    expect(container.querySelectorAll('a')).toHaveLength(0)
  })
})
