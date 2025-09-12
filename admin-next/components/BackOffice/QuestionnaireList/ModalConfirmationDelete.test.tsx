/* eslint-env jest */
import { render } from '@testing-library/react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import type { ModalConfirmationDeleteTestQuery } from '@relay/ModalConfirmationDeleteTestQuery.graphql'
import ModalConfirmationDelete from './ModalConfirmationDelete'

describe('<ModalConfirmationDelete />', () => {
  let environment: any
  let TestModalConfirmationDelete: any

  const query = graphql`
    query ModalConfirmationDeleteTestQuery($id: ID = "<default>") @relay_test_operation {
      questionnaire: node(id: $id) {
        ...ModalConfirmationDelete_questionnaire
      }
    }
  `

  const defaultMockResolvers = {
    Questionnaire: () => ({
      id: 'questionnaire-1',
      title: 'Combien font 0 + 0 ?',
    }),
  }

  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    const queryVariables = {}

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ModalConfirmationDeleteTestQuery>(query, variables)

      if (data?.questionnaire) {
        return <ModalConfirmationDelete questionnaire={data?.questionnaire} {...componentProps} />
      }

      return null
    }

    TestModalConfirmationDelete = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })

  afterEach(() => {
    clearSupportForPortals()
  })

  describe('<TestModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      const { asFragment } = render(
        <TestModalConfirmationDelete connectionName="client:root:__QuestionnaireList_questionnaires_connection" />,
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render modal open', () => {
      const { asFragment, getByRole } = render(
        <TestModalConfirmationDelete connectionName="client:root:__QuestionnaireList_questionnaires_connection" />,
      )
      const button = getByRole('button')
      button.click()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
