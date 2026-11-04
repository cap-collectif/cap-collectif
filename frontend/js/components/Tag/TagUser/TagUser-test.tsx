import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment } from 'relay-test-utils'
import { RelaySuspensFragmentTest, enableFeatureFlags } from '~/testUtils'
import { initialState } from '~/redux/modules/default'
import type { TagUserTestQuery } from '~relay/TagUserTestQuery.graphql'
import TagUser from './TagUser'

/**
 * @jest-status compliant
 * @jest-reason Checks author names, profile links and avatars in the DOM through the real fragments and simulated Relay responses.
 */
describe('Author tags', () => {
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

  const query = graphql`
    query TagUserTestQuery @relay_test_operation {
      node(id: "author-id") {
        ...TagUser_user
      }
    }
  `
  const TestTag = () => {
    const data = useLazyLoadQuery<TagUserTestQuery>(query, {})
    return data.node ? <TagUser user={data.node} size="sm" /> : null
  }

  test.each([
    ['User', 'Alice', '/alice.jpg', '/profile/alice'],
    ['Organization', 'Collective', '/collective.png', '/organization/collective'],
    ['User', 'Profil anonymisé', '/svg/anonymized-profile.svg', ''],
    ['Organization', 'Collective without logo', null, '/organization/collective'],
  ])('renders %s %s', async (type, name, avatarUrl, url) => {
    const environment = createMockEnvironment()
    environment.mock.queueOperationResolver(() => ({
      data: {
        node: {
          __typename: type,
          __isNode: type,
          __isAuthor: type,
          ...(type === 'User' ? { __isContributor: type } : {}),
          id: 'author-id',
          username: name,
          displayName: name,
          avatarUrl,
          url,
        },
      },
    }))
    await act(async () => {
      root.render(
        <RelaySuspensFragmentTest
          environment={environment}
          store={{ default: { ...initialState, features: { ...initialState.features, profiles: true } } }}
        >
          <TestTag />
        </RelaySuspensFragmentTest>,
      )
    })
    expect(container.textContent).toContain(name)
    expect(container.querySelector('img')?.getAttribute('src') ?? null).toBe(avatarUrl)
    const links = Array.from(container.querySelectorAll('a'))
    expect(links).toHaveLength(url ? (avatarUrl ? 2 : 1) : 0)
    links.forEach(link => expect(link.getAttribute('href')).toBe(url))
  })
})
