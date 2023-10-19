/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { SectionSendDomainsTestQuery } from '~relay/SectionSendDomainsTestQuery.graphql'
import SectionSendingDomains from './SectionSendingDomains'

describe('<SectionSendingDomains />', () => {
  let environment
  let testComponentTree
  let TestSectionSendingDomains
  const query = graphql`
    query SectionSendDomainsTestQuery @relay_test_operation {
      senderEmails {
        ...SectionSendingDomains_senderEmails
      }
      senderEmailDomains {
        ...SectionSendingDomains_senderEmailDomains
      }
    }
  `
  const defaultMockResolvers = {
    SenderEmailDomain: () => ({
      id: 'sender-email-domain-1',
      value: 'test.com',
      service: 'MAILJET',
      spfValidation: 'true',
      dkimValidation: 'true',
    }),
    SenderEmail: () => ({
      address: 'vince@test.com',
    }),
  }
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionSendDomainsTestQuery>(query, variables)
      if (!data) return null
      return (
        <SectionSendingDomains
          senderEmails={data.senderEmails}
          senderEmailDomains={data.senderEmailDomains}
          {...componentProps}
        />
      )
    }

    TestSectionSendingDomains = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  describe('<TestSectionSendingDomains />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionSendingDomains />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
