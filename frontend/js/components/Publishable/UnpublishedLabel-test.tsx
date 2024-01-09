/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import UnpublishedLabel from './UnpublishedLabel'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { UnpublishedLabelTestQuery } from '~relay/UnpublishedLabelTestQuery.graphql'

describe('<UnpublishedLabel />', () => {
  let environment
  let testComponentTree
  let TestUnpublishedLabel
  const defaultMockResolvers = {
    Publishable: () => ({
      id: 'id1',
      published: true,
      publishableUntil: null,
      notPublishedReason: null,
    }),
  }
  const query = graphql`
    query UnpublishedLabelTestQuery($id: ID = "<default>") @relay_test_operation {
      publishable: node(id: $id) {
        ...UnpublishedLabel_publishable
      }
    }
  `
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<UnpublishedLabelTestQuery>(query, {})
      if (!data.publishable) return null
      return <UnpublishedLabel publishable={data.publishable} {...props} />
    }

    TestUnpublishedLabel = props => (
      <RelaySuspensFragmentTest
        environment={environment}
        store={{
          user: {
            user: {
              email: 'unconfirmed-email@gmail.com',
            },
          },
        }}
        useCapUIProvider
      >
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  describe('<TestUnpublishedLabel />', () => {
    it('renders when published', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, defaultMockResolvers),
      )
      testComponentTree = ReactTestRenderer.create(<TestUnpublishedLabel />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('renders when not published because author must confirm', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Publishable: () => ({
            id: 'id1',
            published: false,
            publishableUntil: null,
            notPublishedReason: 'WAITING_AUTHOR_CONFIRMATION',
          }),
        }),
      )
      testComponentTree = ReactTestRenderer.create(<TestUnpublishedLabel />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('renders when not published because author is not confirmed', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Publishable: () => ({
            id: 'id1',
            published: false,
            publishableUntil: null,
            notPublishedReason: 'AUTHOR_NOT_CONFIRMED',
          }),
        }),
      )
      testComponentTree = ReactTestRenderer.create(<TestUnpublishedLabel />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('renders when not published because author confirmed his account too late', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Publishable: () => ({
            id: 'id1',
            published: false,
            publishableUntil: null,
            notPublishedReason: 'AUTHOR_CONFIRMED_TOO_LATE',
          }),
        }),
      )
      testComponentTree = ReactTestRenderer.create(<TestUnpublishedLabel />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
