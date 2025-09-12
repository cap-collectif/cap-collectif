/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import MediatorList from './MediatorList'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from 'tests/testUtils'
import type { MediatorListTestQuery } from '@relay/MediatorListTestQuery.graphql'

describe('<MediatorList />', () => {
  let environment: any
  let TestComponent: any

  const defaultMockResolvers = {
    Node: () => ({
      steps: [
        {
          id: 'stepId',
          title: 'Etape de vote',
          mediators: {
            __id: 'client:VXNlcjp1c2VyMQ==:MediatorList_mediators_connection',
            edges: [
              {
                node: {
                  id: 'UHJvamVjdDpwcm9qZWN0QXJjaGl2ZWQ=',
                  totalParticipantsAccounted: 2,
                  totalParticipantsOptIn: 3,
                  user: {
                    username: 'Mediateur 1',
                  },
                  votes: {
                    totalCount: 3,
                  },
                  participants: {
                    totalCount: 3,
                  },
                },
              },
              {
                node: {
                  id: 'UHJvamDfooke4XJjaGl2ZWQ=',
                  totalParticipantsAccounted: 0,
                  totalParticipantsOptIn: 0,
                  user: {
                    username: 'Mediateur 2',
                  },
                  votes: {
                    totalCount: 0,
                  },
                  participants: {
                    totalCount: 0,
                  },
                },
              },
            ],
          },
        },
      ],
    }),
  }
  const query = graphql`
    query MediatorListTestQuery($term: String) @relay_test_operation {
      node(id: "<default>") {
        ... on Project {
          ...MediatorList_project @arguments(term: $term)
        }
      }
    }
  `

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {
      term: null,
    }

    const TestRenderer = props => {
      const data = useLazyLoadQuery<MediatorListTestQuery>(query, queryVariables)
      if (!data.node) return null
      return <MediatorList project={data.node} resetTerm={jest.fn()} {...props} />
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

  it('should render correctly and display mediators', () => {
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
