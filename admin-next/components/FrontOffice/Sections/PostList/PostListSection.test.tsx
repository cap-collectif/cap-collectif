/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from 'tests/testUtils'
import PostListSection from './PostListSection'
import { PostListSectionTestQuery } from '@relay/PostListSectionTestQuery.graphql'

describe('<PostListSection />', () => {
  let environment: any
  let testComponentTree: any
  let TestModalConfirmationDelete: any

  const query = graphql`
    query PostListSectionTestQuery @relay_test_operation {
      ...PostListSection_query
    }
  `

  const defaultMockResolvers = {
    Query: () => ({
      posts: {
        totalCount: 1,
        edges: [{ node: { id: 'post1', url: 'site.com/table-ronde', title: 'Table Ronde' } }],
      },
    }),
  }

  beforeEach(() => {
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ queryVariables: variables }) => {
      const data = useLazyLoadQuery<PostListSectionTestQuery>(query, variables)

      if (data) {
        return <PostListSection query={data} />
      }

      return null
    }

    TestModalConfirmationDelete = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )
  })

  it('should render correctly', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    testComponentTree = ReactTestRenderer.create(<TestModalConfirmationDelete />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
