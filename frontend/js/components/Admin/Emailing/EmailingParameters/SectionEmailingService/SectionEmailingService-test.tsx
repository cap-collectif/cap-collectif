/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'
import type { SectionEmailingServiceTestQuery } from '~relay/SectionEmailingServiceTestQuery.graphql'
import SectionEmailingService from './SectionEmailingService'

describe('<SectionEmailingService />', () => {
  let environment
  let testComponentTree
  let TestSectionEmailingService
  const query = graphql`
    query SectionEmailingServiceTestQuery($type: ExternalServiceConfigurationType!) @relay_test_operation {
      externalServiceConfiguration(type: $type) {
        ...SectionEmailingService_externalServiceConfiguration
      }
    }
  `
  const defaultMockResolvers = {
    ExternalServiceConfiguration: () => ({
      value: 'mailjet',
    }),
  }
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {
      type: 'MAILER',
    }

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<SectionEmailingServiceTestQuery>(query, variables)
      if (!data?.externalServiceConfiguration) return null
      return (
        <SectionEmailingService externalServiceConfiguration={data.externalServiceConfiguration} {...componentProps} />
      )
    }

    TestSectionEmailingService = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  afterEach(() => {
    clearSupportForPortals()
  })
  describe('<TestSectionEmailingService />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestSectionEmailingService />)
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
