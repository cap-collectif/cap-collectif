/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest } from '~/testUtils'
import type { EventModerationMotiveTestQuery } from '~relay/EventModerationMotiveTestQuery.graphql'
import EventModerationMotive from './EventModerationMotive'

describe('<EventModerationMotive />', () => {
  let environment
  let testComponentTree
  let TestEventModerationMotive
  const query = graphql`
    query EventModerationMotiveTestQuery($id: ID!) @relay_test_operation {
      event: node(id: $id) {
        ... on Event {
          ...EventModerationMotive_event
        }
      }
    }
  `
  const defaultMockResolvers = {
    Event: () => ({
      review: {
        id: 'reviewId',
        status: 'REFUSED',
        refusedReason: null,
        comment: null,
      },
    }),
  }
  beforeEach(() => {
    environment = createMockEnvironment()
    const queryVariables = {
      id: 'id',
    }

    const TestRenderer = ({ queryVariables: variables }) => {
      const data = useLazyLoadQuery<EventModerationMotiveTestQuery>(query, variables)
      if (!data || !data.event) return null
      return <EventModerationMotive eventRef={data.event} />
    }

    TestEventModerationMotive = () => (
      <RelaySuspensFragmentTest environment={environment} useCapUIProvider>
        <TestRenderer queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  describe('<TestEventModerationMotive />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestEventModerationMotive />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
