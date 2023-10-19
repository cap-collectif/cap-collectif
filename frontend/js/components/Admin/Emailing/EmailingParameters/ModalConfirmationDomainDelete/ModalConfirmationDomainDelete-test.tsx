/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { ModalConfirmationDomainDeleteTestQuery } from '~relay/ModalConfirmationDomainDeleteTestQuery.graphql'
import ModalConfirmationDomainDelete from './ModalConfirmationDomainDelete'

describe('<ModalConfirmationDomainDelete />', () => {
  let environment
  let testComponentTree
  let TestModalConfirmationDomainDelete
  const query = graphql`
    query ModalConfirmationDomainDeleteTestQuery @relay_test_operation {
      senderEmailDomains {
        ...ModalConfirmationDomainDelete_senderEmailDomain
      }
    }
  `
  const defaultMockResolvers = {
    SenderEmailDomain: () => ({
      id: 'sender-email-domain-1',
      value: 'test.com',
    }),
  }
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ModalConfirmationDomainDeleteTestQuery>(query, variables)

      if (data?.senderEmailDomains) {
        return <ModalConfirmationDomainDelete senderEmailDomain={data?.senderEmailDomains[0]} {...componentProps} />
      }

      return null
    }

    TestModalConfirmationDomainDelete = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  describe('<TestModalConfirmationDomainDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalConfirmationDomainDelete />)
      expect(testComponentTree).toMatchSnapshot()
    })
    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalConfirmationDomainDelete />)
      const fakeEvent = {}
      testComponentTree.root.findByType('button').props.onClick(fakeEvent)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
