/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import RenderCustomAccess from './RenderCustomAccess'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { RenderCustomAccessTestQuery } from '~relay/RenderCustomAccessTestQuery.graphql'

describe('<RenderCustomAccess />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    Project: () => ({
      restrictedViewers: {
        totalUserCount: 15,
      },
    }),
  }
  const query = graphql`
    query RenderCustomAccessTestQuery($id: ID = "<default>", $first: Int, $cursor: String) @relay_test_operation {
      project: node(id: $id) {
        ...RenderCustomAccess_project @arguments(count: $first, cursor: $cursor)
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<RenderCustomAccessTestQuery>(query, {})
      if (!data.project) return null
      return <RenderCustomAccess project={data.project} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />)
    expect(wrapper).toMatchSnapshot()
  })
})
