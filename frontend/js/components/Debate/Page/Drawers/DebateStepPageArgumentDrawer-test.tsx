/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals, mockRandomValues } from '~/testUtils'
import type { DebateStepPageArgumentDrawerTestQuery } from '~relay/DebateStepPageArgumentDrawerTestQuery.graphql'
import DebateStepPageArgumentDrawer from './DebateStepPageArgumentDrawer'

describe('<DebateStepPageArgumentDrawer />', () => {
  let environment
  let testComponentTree
  let TestComponent
  let onClose
  const baseArgument = {
    id: 'debateArgument1',
    type: 'FOR',
    body: 'coucou',
    viewerCanReport: true,
    viewerDidAuthor: false,
    viewerHasVote: false,
    votes: {
      totalCount: 10,
    },
  }
  const defaultMockResolvers = {
    DebateArgument: () => baseArgument,
    User: () => ({
      isAdmin: false,
      username: 'Agui le penseur',
      media: {
        url: '<media-url>',
      },
      biography: 'Jsuis né dans les favela au brésil',
    }),
  }
  const query = graphql`
    query DebateStepPageArgumentDrawerTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!)
    @relay_test_operation {
      argument: node(id: $id) {
        ...DebateStepPageArgumentDrawer_argument @arguments(isAuthenticated: $isAuthenticated)
      }
      viewer {
        ...DebateStepPageArgumentDrawer_viewer
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    // TODO: there is a random id but I can't find where
    mockRandomValues()
    addsSupportForPortals()
    environment = createMockEnvironment()
    onClose = jest.fn()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<DebateStepPageArgumentDrawerTestQuery>(query, {
        isAuthenticated: true,
      })
      if (!data.argument) return null
      return <DebateStepPageArgumentDrawer argument={data.argument} viewer={data.viewer} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render when open', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render when open and viewer is the author', async () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        DebateArgument: () => ({ ...baseArgument, viewerCanReport: false, viewerDidAuthor: true }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render when open and viewer has vote', async () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        DebateArgument: () => ({ ...baseArgument, viewerHasVote: true }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render nothing when closed', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen={false} onClose={onClose} />)

    expect(testComponentTree.toJSON().props.className.includes('toasts-container')).toBe(true)
    expect(testComponentTree.toJSON().children).toBeNull()
  })
})
