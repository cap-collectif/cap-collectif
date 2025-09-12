/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from 'tests/testUtils'
import { NavBarContext } from 'shared/navbar/NavBar.context'
import Organization from './Organization'

describe('<Organization />', () => {
  const title = 'Nice Org'
  const projectTitle = 'My nice project'
  const eventTitle = 'My nice event'
  const postTitle = 'My nice post'

  let environment
  let TestComponent
  const defaultMockResolvers = {
    Organization: () => ({
      id: 'org-id-1',
      title,
      projectsCount: { totalCount: 1 },
      eventsCount: { totalCount: 1 },
      postsCount: { totalCount: 1 },
      eventsFuture: { totalCount: 0 },
      projects: { totalCount: 1, edges: [{ node: { id: 'project-id-1', title: projectTitle } }] },
      events: { totalCount: 1, edges: [{ node: { id: 'event-id-1', title: eventTitle } }] },
      posts: { totalCount: 1, edges: [{ node: { id: 'post-id-1', title: postTitle } }] },
    }),
  }

  beforeEach(() => {
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    TestComponent = () => (
      <NavBarContext.Provider value={{ setBreadCrumbItems: jest.fn() }}>
        <RelaySuspensFragmentTest environment={environment}>
          <Organization slug="nice-org" organization={{ title }} />
        </RelaySuspensFragmentTest>
      </NavBarContext.Provider>
    )
  })
  it('renders correctly', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
