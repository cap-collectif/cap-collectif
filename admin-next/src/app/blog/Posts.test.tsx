/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from 'tests/testUtils'
import Posts from './Posts'

describe('<Posts />', () => {
  let environment
  let TestComponent
  let testComponentTree
  const queryResolver = {
    Query: () => ({
      posts: { totalCount: 1, edges: [{ node: { id: 'post-id-1', title: 'Nice post' } }] },
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, queryResolver))

    TestComponent = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <Posts title="Liste des actus" body="Lorem ipsum" />
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
