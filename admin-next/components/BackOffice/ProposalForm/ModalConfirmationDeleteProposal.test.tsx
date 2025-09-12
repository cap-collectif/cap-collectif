/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { ModalConfirmationDeleteProposalFormTestQuery } from '@relay/ModalConfirmationDeleteProposalFormTestQuery.graphql'
import ModalConfirmationDelete from './ModalConfirmationDelete'

describe('<ModalConfirmationDelete />', () => {
  let environment: any
  let TestModalConfirmationDelete: any

  const query = graphql`
    query ModalConfirmationDeleteProposalFormTestQuery($id: ID = "<default>") @relay_test_operation {
      proposalForm: node(id: $id) {
        ...ModalConfirmationDelete_proposalForm
      }
    }
  `

  const defaultMockResolvers = {
    ProposalForm: () => ({
      id: 'proposalForm-1',
      title: 'Combien font 0 + 0 ?',
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({
      componentProps,
      queryVariables: variables,
    }: {
      componentProps: any
      queryVariables: any
    }) => {
      const data = useLazyLoadQuery<ModalConfirmationDeleteProposalFormTestQuery>(query, variables)

      if (data?.proposalForm) {
        return <ModalConfirmationDelete proposalForm={data?.proposalForm} {...componentProps} />
      }

      return null
    }

    TestModalConfirmationDelete = (componentProps: any) => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver((operation: any) =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    )
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      const { asFragment } = render(
        <TestModalConfirmationDelete
          connectionName="client:root:__ProposalFormList_proposalForms_connection"
          isAdmin
        />,
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render modal open', () => {
      const { asFragment, getByRole } = render(
        <TestModalConfirmationDelete
          connectionName="client:root:__ProposalFormList_proposalForms_connection"
          isAdmin
        />,
      )
      const button = getByRole('button')
      button.click()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
