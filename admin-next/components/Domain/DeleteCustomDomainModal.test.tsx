/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import DeleteCustomDomainModal from './DeleteCustomDomainModal'
import type { DeleteCustomDomainModalTestQuery } from '@relay/DeleteCustomDomainModalTestQuery.graphql'

const onClose = jest.fn()
const onSuccess = jest.fn()

describe('<DeleteCustomDomainModal />', () => {
  let environment: any
  let testComponentTree: any
  let TestDeleteCustomDomainModal: any

  const query = graphql`
    query DeleteCustomDomainModalTestQuery @relay_test_operation {
      siteSettings {
        ...DeleteCustomDomainModal_siteSettings
      }
    }
  `

  const defaultMockResolvers = {
    SiteSettings: () => ({
      capcoDomain: 'capco.domain.com',
      customDomain: 'custom.domain.com',
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<DeleteCustomDomainModalTestQuery>(query, variables)
      if (data) {
        return <DeleteCustomDomainModal siteSettings={data.siteSettings} {...componentProps} />
      }

      return null
    }

    TestDeleteCustomDomainModal = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestDeleteCustomDomainModal />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(
        <TestDeleteCustomDomainModal show onClose={onClose} onSuccess={onSuccess} />,
      )
      expect(testComponentTree).toMatchSnapshot()
    })
  })
})
