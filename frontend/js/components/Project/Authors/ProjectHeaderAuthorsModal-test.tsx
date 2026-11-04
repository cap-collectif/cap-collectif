/* eslint-env jest */
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProjectHeaderAuthorsModal from './ProjectHeaderAuthorsModal'
import { enableFeatureFlags, RelaySuspensFragmentTest } from '~/testUtils'
import type { ProjectHeaderAuthorsModalTestQuery } from '~relay/ProjectHeaderAuthorsModalTestQuery.graphql'

/**
 * @jest-status compliant
 * @jest-reason Checks author names, avatars and links in the DOM using real Relay fragments.
 */
describe('<ProjectHeaderAuthorsModal />', () => {
  let container: HTMLDivElement
  let root: Root
  const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  let originalActEnvironment: boolean | undefined
  const featureFlagMock = (globalThis as typeof globalThis & { mockFeatureFlag: jest.Mock }).mockFeatureFlag
  let originalFeatureFlagImplementation: ReturnType<typeof featureFlagMock.getMockImplementation>
  const query = graphql`
    query ProjectHeaderAuthorsModalTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderAuthorsModal_project
      }
    }
  `
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
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    root = createRoot(container)
    originalFeatureFlagImplementation = featureFlagMock.getMockImplementation()
    enableFeatureFlags(['profiles'])
  })

  it('shows user, organization and anonymized author avatars with their public links', async () => {
    const environment = createMockEnvironment()
    const authors = [
      { __typename: 'User', id: 'user', username: 'Alice', avatarUrl: '/alice.png', url: '/profile/alice' },
      {
        __typename: 'Organization',
        id: 'organization',
        username: 'Collective',
        avatarUrl: '/collective.png',
        url: '/organization/collective',
      },
      {
        __typename: 'User',
        id: 'anonymized-user',
        username: 'Profil anonymisé',
        avatarUrl: '/svg/anonymized-profile.svg',
        url: '',
      },
    ]

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProjectHeaderAuthorsModalTestQuery>(query, {})
      if (!data.project) return null
      return <ProjectHeaderAuthorsModal project={data.project} onClose={jest.fn()} show />
    }

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        Project: () => ({ authors }),
        User: () => ({ userType: { name: 'Citizen' } }),
      }),
    )

    await act(async () => {
      root.render(
        <RelaySuspensFragmentTest environment={environment} useCapUIProvider>
          <TestRenderer />
        </RelaySuspensFragmentTest>,
      )
    })

    // The shared setup replaces the modal shell, but keeps its author content and Relay fragments.
    for (const author of authors) {
      expect(container.textContent).toContain(author.username)
      const avatar = container.querySelector(`img[alt="${author.username}"]`)
      expect(avatar?.getAttribute('src')).toBe(author.avatarUrl)
      const nameLink = Array.from(container.querySelectorAll('a')).find(link => link.textContent === author.username)
      if (author.url) {
        expect(nameLink?.getAttribute('href')).toBe(author.url)
      } else {
        expect(nameLink).toBeUndefined()
        expect(avatar?.closest('a')).toBeNull()
      }
    }
  })
})
