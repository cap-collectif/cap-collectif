/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import EventModalConfirmationDelete from './EventModalConfirmationDelete'
import { EventModalConfirmationDeleteTestQuery } from '@relay/EventModalConfirmationDeleteTestQuery.graphql'

describe('<EventModalConfirmationDelete />', () => {
  let environment: any
  let testComponentTree
  let TestEventModalConfirmationDelete: any

  const query = graphql`
    query EventModalConfirmationDeleteTestQuery($id: ID = "<default>") @relay_test_operation {
      event: node(id: $id) {
        ...EventModalConfirmationDelete_event
      }
    }
  `

  const defaultMockResolvers = {
    Post: () => ({
      id: 'RXZlbnQ6ZXZlbnQz',
      title: 'GrenobleWeb2015',
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver((operation: any) =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    )
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<EventModalConfirmationDeleteTestQuery>(query, variables)

      if (data?.event) {
        return <EventModalConfirmationDelete event={data?.event} {...componentProps} affiliations={null} />
      }

      return null
    }

    TestEventModalConfirmationDelete = (componentProps: any) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestEventModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestEventModalConfirmationDelete />)
      expect(testComponentTree).toMatchSnapshot()
    })

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(<TestEventModalConfirmationDelete />)
      const fakeEvent = {}
      testComponentTree.root.findByType('button').props.onClick(fakeEvent)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
