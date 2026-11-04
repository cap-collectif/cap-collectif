/* eslint-env jest */
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, enableFeatureFlags } from '~/testUtils'
import type { ProjectAdminParticipantTestQuery } from '~relay/ProjectAdminParticipantTestQuery.graphql'
import type { OwnProps } from './ProjectAdminParticipant'
import ProjectAdminParticipant from './ProjectAdminParticipant'

/**
 * @jest-status compliant
 * @jest-reason Checks participant identity, avatar and selection controls in the DOM with explicit Relay responses.
 */
describe('<ProjectAdminParticipant />', () => {
  let environment
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

  let TestComponent
  const defaultMockResolvers = {
    User: () => ({
      lastLogin: '2021-04-02 10:15:34',
      username: 'Alice',
      isAnonymized: false,
    }),
  }
  const query = graphql`
    query ProjectAdminParticipantTestQuery($id: ID = "<default>") @relay_test_operation {
      participant: node(id: $id) {
        ...ProjectAdminParticipant_participant @arguments(viewerIsAdmin: true)
      }
    }
  `
  beforeEach(() => {
    environment = createMockEnvironment()

    const TestRenderer = (props: OwnProps) => {
      const data = useLazyLoadQuery<ProjectAdminParticipantTestQuery>(query, {})
      if (!data.participant) return null
      return <ProjectAdminParticipant participant={data.participant} {...props} />
    }

    TestComponent = (props: OwnProps) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  test.each([false, true])('shows selection controls only when emailing is %s', async emailing => {
    enableFeatureFlags(emailing ? ['emailing'] : [])
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    await act(async () => {
      root.render(<TestComponent rowId="1" selected={false} />)
    })
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(emailing ? 1 : 0)
  })

  test.each([
    ['User', false, 'Alice', '/alice.jpg', '/admin/author'],
    ['User', true, 'Profil anonymisé', '/svg/anonymized-profile.svg', null],
    ['Participant', true, 'Profil anonymisé', '/svg/anonymized-profile.svg', null],
    ['Participant', false, 'no-account-user', null, null],
  ])('renders %s with anonymized status %s', async (type, isAnonymized, expectedName, avatarUrl, expectedLink) => {
    environment.mock.queueOperationResolver(() => ({
      data: {
        participant: {
          __typename: type,
          __isNode: type,
          __isContributor: type,
          ...(type === 'User' ? { __isAuthor: type } : {}),
          id: 'participant-id',
          username: isAnonymized ? 'Profil anonymisé' : 'Alice',
          isAnonymized,
          avatarUrl,
          url: '',
          adminUrl: '/admin/author',
          firstname: null,
          lastname: null,
          lastLogin: null,
          email: null,
          vip: false,
          isEmailConfirmed: false,
          userType: null,
          consentInternalCommunication: false,
          votes: { totalCount: 0 },
          contributions: { totalCount: 0 },
        },
      },
    }))
    await act(async () => {
      root.render(<TestComponent rowId="1" selected={false} />)
    })
    expect(container.textContent).toContain(expectedName)
    const links = Array.from(container.querySelectorAll('a'))
    expect(links).toHaveLength(expectedLink ? 1 : 0)
    if (expectedLink) expect(links[0].getAttribute('href')).toBe(expectedLink)
    if (avatarUrl) expect(container.querySelector('img')?.getAttribute('src')).toBe(avatarUrl)
  })
})
