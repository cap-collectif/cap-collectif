/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { NavBarContext } from 'shared/navbar/NavBar.context'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from 'tests/testUtils'
import Projects from './Projects'

describe('<Projects />', () => {
  let environment
  let TestComponent
  const queryResolver = {
    Query: () => ({
      projects: { totalCount: 1, edges: [{ node: { id: 'project-id-1', title: 'Nice project' } }] },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, queryResolver))

    TestComponent = () => (
      <NavBarContext.Provider value={{ setBreadCrumbItems: jest.fn() }}>
        <RelaySuspensFragmentTest environment={environment}>
          <Projects title="Liste des projets" body="Lorem ipsum" />
        </RelaySuspensFragmentTest>
      </NavBarContext.Provider>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('renders correctly', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
