/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from 'tests/testUtils'
import Projects from './Projects'

describe('<Projects />', () => {
  let environment
  let TestComponent
  let testComponentTree
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
      <RelaySuspensFragmentTest environment={environment}>
        <Projects title="Liste des projets" body="Lorem ipsum" />
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  it('renders correctly', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
