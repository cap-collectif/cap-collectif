/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import ProposalFormItem from './ProposalFormItem'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { ProposalFormItemTestQuery } from '@relay/ProposalFormItemTestQuery.graphql'

describe('<ProposalFormItem />', () => {
  let environment: any
  let TestComponent: any

  const defaultMockResolvers = {
    ProposalForm: () => ({
      id: 'proposalFormOrgaAdmin',
      title: 'Formulaire organisation cr\u00e9e par un admin',
      adminUrl: 'https://capco.dev/admin/capco/app/proposalform/proposalFormOrgaAdmin/edit?_locale=fr-FR',
      createdAt: '2022-10-25 10:02:21',
      updatedAt: '2022-10-25 10:02:11',
      step: {
        project: null,
        id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBPcmdh',
      },
      owner: {
        __typename: 'Organization',
        id: 'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=',
        username: 'GIEC',
      },
      creator: {
        __typename: 'User',
        id: 'VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=',
        username: 'Val\u00e9rie Masson Delmotte',
      },
      __typename: 'ProposalForm',
    }),
    User: () => ({
      isAdminOrganization: false,
      isAdmin: false,
      organizations: null,
    }),
  }

  const orgaMemberMockResolvers = {
    ...defaultMockResolvers,
    User: context => {
      if (context.name === 'creator') {
        return {
          __typename: 'User',
          id: 'VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=',
          username: 'Val\u00e9rie Masson Delmotte',
        }
      }
      return {
        username: 'alex',
        id: 'abc',
        isAdminOrganization: false,
        isAdmin: false,
        organizations: [
          {
            id: 'organizationId',
          },
        ],
      }
    },
  }

  const query = graphql`
    query ProposalFormItemTestQuery($id: ID = "<default>") @relay_test_operation {
      proposalForm: node(id: $id) {
        ...ProposalFormItem_proposalForm
      }
      viewer {
        ...ProposalFormItem_viewer
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}
    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProposalFormItemTestQuery>(query, queryVariables)
      if (!data.proposalForm && !data.viewer) return null
      return (
        <ProposalFormItem
          proposalForm={data.proposalForm}
          viewer={data.viewer}
          connectionName="client:VXNlcjp1c2VyMQ==:__ProposalFormList_proposalForms_connection"
          {...props}
        />
      )
    }
    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )
  })

  it('should render correctly', () => {
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should hide delete button when viewer belongs to an organization and is not admin organization', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, orgaMemberMockResolvers),
    )
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
