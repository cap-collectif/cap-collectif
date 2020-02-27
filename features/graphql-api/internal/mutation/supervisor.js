/* eslint-env jest */
import '../../_setup';

const ChangeProposalAssessmentMutation = /* GraphQL*/ `
  mutation ChangeProposalAssessmentMutation($input: ChangeProposalAssessmentInput!) {
    changeProposalAssessment(input: $input) {
      userErrors {
        message
      }
      assessment {
        id
        body
        state
        officialResponse
        estimation
        updatedBy {
          id
          firstname
          lastname
        }
      }
    }
  }
`;

const EvaluateProposalAssessmentMutation = /* GraphQL */ `
  mutation EvaluateProposalAssessmentMutation($input: EvaluateProposalAssessmentInput!) {
    evaluateProposalAssessment(input: $input) {
      userErrors {
        message
      }
      assessment {
        id
        state
        estimation
        body
        officialResponse
        updatedBy {
          id
          firstname
          lastname
        }
      }
    }
  }
`;

const BASE_ASSESSMENT = {
  body: 'Un elfe oserait aller sous terre alors qu’un nain ne le voudrait pas ?',
  officialResponse: 'Françaises, français, je vous ai compris !',
  estimation: 1500,
};

describe('mutations.changeProposalAssessment', () => {
  it('should create a new empty proposal assessment on the proposal.', async () => {
    const createAssessment = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTA=' },
      },
      'internal_supervisor',
    );
    expect(createAssessment).toMatchSnapshot({
      changeProposalAssessment: {
        assessment: {
          id: expect.any(String),
        },
      },
    });
  });

  it('should modify the specified proposal assessment.', async () => {
    const changeAssessment = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { ...BASE_ASSESSMENT, proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=' },
      },
      'internal_supervisor',
    );
    expect(changeAssessment).toMatchSnapshot();
  });

  it('should evaluate the proposal assesment', async () => {
    const evaluateAssessment = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=', decision: 'FAVOURABLE' },
      },
      'internal_supervisor',
    );
    expect(evaluateAssessment).toMatchSnapshot();
  });

  it('should not change the proposal assessment if the user is not assigned to.', async () => {
    const changeAssessmentNotAssigned = await graphql(
      ChangeProposalAssessmentMutation,
      {
        input: { ...BASE_ASSESSMENT, proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=' },
      },
      'internal_user',
    );
    expect(changeAssessmentNotAssigned).toMatchSnapshot();
  });
});

describe('mutations.evaluateProposaAssessment', () => {
  it('should evaluate the proposal assesment when authenticated a supervisor', async () => {
    const evaluateAssessment = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=', decision: 'FAVOURABLE' },
      },
      'internal_supervisor',
    );
    expect(evaluateAssessment).toMatchSnapshot();
  });

  it('should not modify the proposal assessment state value when authenticated as a user', async () => {
    const evaluateAssessmentNotAssigned = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=', decision: 'UNFAVOURABLE' },
      },
      'internal_user',
    );
    expect(evaluateAssessmentNotAssigned).toMatchSnapshot();
  });

  it('should not evaluate the proposal assesment if official response is empty when authenticated a supervisor', async () => {
    const evaluateAssessment = await graphql(
      EvaluateProposalAssessmentMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=', decision: 'FAVOURABLE' },
      },
      'internal_supervisor',
    );
    expect(evaluateAssessment).toMatchSnapshot();
  });
});
