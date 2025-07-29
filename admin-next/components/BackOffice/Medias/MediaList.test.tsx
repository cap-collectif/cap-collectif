/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import MediaList from './MediaList'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import { MediaListTestQuery } from '@relay/MediaListTestQuery.graphql'

describe('<MediaList />', () => {
  let environment: any
  let TestComponent: any

  const defaultMockResolvers = {
    Query: () => ({
      medias: {
        __id: 'client:VXNlcjp1c2VyMQ==:__MediaList_medias_connection',
        totalCount: 2,
        edges: [
          {
            node: {
              id: 'UG9zdDpwb3N0MTI=',
              name: 'Media 1',
              url: '/media/1.png',
              providerReference: 'media1.png',
              width: 200,
              height: 200,
              size: 40000,
              createdAt: '29-08-2024',
            },
          },
          {
            node: {
              id: 'UG9zdDpwb3N0MTL=',
              name: 'Media 2',
              url: '/media/2.png',
              providerReference: 'media2.png',
              width: 100,
              height: 300,
              size: 30000,
              createdAt: '29-08-2024',
            },
          },
        ],
      },
    }),
  }
  const query = graphql`
    query MediaListTestQuery($count: Int!, $cursor: String, $term: String) @relay_test_operation {
      ...MediaList_query @arguments(count: $count, cursor: $cursor, term: $term)
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {
      count: 10,
      cursor: null,
      term: null,
    }

    const TestRenderer = props => {
      const data = useLazyLoadQuery<MediaListTestQuery>(query, queryVariables)
      if (!data) return null
      return <MediaList query={data} onReset={jest.fn()} {...props} />
    }
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })

  it('should render correctly in list view', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent view="LIST" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly in grid view', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent view="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
})
