/* eslint-env jest */
import '../../../../_setup'

const ChangeProposalAssessmentMutation = /* GraphQL*/ `
  mutation ChangeProposalAssessmentMutation($input: ChangeProposalAssessmentInput!) {
    changeProposalAssessment(input: $input) {
      errorCode
      assessment {
        id
        body
        state
        officialResponse
        estimatedCost
        supervisor {
          id
          firstname
          lastname
        }
      }
    }
  }
`

const EvaluateProposalAssessmentMutation = /* GraphQL */ `
  mutation EvaluateProposalAssessmentMutation($input: EvaluateProposalAssessmentInput!) {
    evaluateProposalAssessment(input: $input) {
      errorCode
      assessment {
        id
        state
        estimatedCost
        body
        officialResponse
        supervisor {
          id
          firstname
          lastname
        }
      }
    }
  }
`

const BASE_ASSESSMENT = {
  body: 'Un elfe oserait aller sous terre alors qu’un nain ne le voudrait pas ?',
  officialResponse: 'Françaises, français, je vous ai compris !',
  estimatedCost: 1500,
}

describe('mutations.changeProposalAssessment', () => {
  it('should create a new proposal assessment on the proposal.', async () => {
    const createAssessment = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTA=' },
      },
      'internal_supervisor',
    )
    expect(createAssessment).toMatchSnapshot({
      changeProposalAssessment: {
        assessment: {
          id: expect.any(String),
        },
      },
    })
  })

  it('should modify the specified proposal assessment.', async () => {
    const changeAssessment = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { ...BASE_ASSESSMENT, proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=' },
      },
      'internal_supervisor',
    )
    expect(changeAssessment).toMatchSnapshot({
      changeProposalAssessment: {
        assessment: {
          id: expect.any(String),
        },
      },
    })
  })

  it('should evaluate the proposal assessment', async () => {
    const evaluateAssessment = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: {
          ...BASE_ASSESSMENT,
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
          decision: 'FAVOURABLE',
        },
      },
      'internal_supervisor',
    )
    expect(evaluateAssessment).toMatchSnapshot({
      evaluateProposalAssessment: {
        assessment: {
          id: expect.any(String),
        },
      },
    })
  })

  it('should not change the proposal assessment if the user is not assigned to.', async () => {
    const changeAssessmentNotAssigned = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { ...BASE_ASSESSMENT, proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=' },
      },
      'internal_user',
    )
    expect(changeAssessmentNotAssigned).toMatchSnapshot()
  })
})

describe('mutations.evaluateProposalAssessment', () => {
  it('should evaluate the proposal assessment when authenticated as supervisor', async () => {
    const evaluateAssessment = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: {
          ...BASE_ASSESSMENT,
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
          decision: 'FAVOURABLE',
        },
      },
      'internal_supervisor',
    )
    expect(evaluateAssessment).toMatchSnapshot({
      evaluateProposalAssessment: {
        assessment: {
          id: expect.any(String),
        },
      },
    })
  })

  it('should not modify the proposal assessment state value when authenticated as a user', async () => {
    const evaluateAssessmentNotAssigned = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: {
          ...BASE_ASSESSMENT,
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
          decision: 'UNFAVOURABLE',
        },
      },
      'internal_user',
    )
    expect(evaluateAssessmentNotAssigned).toMatchSnapshot()
  })
})
