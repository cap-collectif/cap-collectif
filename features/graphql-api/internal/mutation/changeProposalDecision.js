/* eslint-env jest */
import '../../_setup';

const ChangeProposalDecisionMutation = /* GraphQL */ `
  mutation ChangeProposalDecisionMutation($input: ChangeProposalDecisionInput!) {
    changeProposalDecision(input: $input) {
      errorCode
      decision {
        isApproved
        state
        refusedReason {
          id
        }
        estimatedCost
        post {
          translations {
            title
            body
          }
          authors {
            id
          }
        }
      }
    }
  }
`;

const ChangeProposalDecisionWithAssessmentMutation = /* GraphQL */ `
  mutation ChangeProposalDecisionMutation($input: ChangeProposalDecisionInput!) {
    changeProposalDecision(input: $input) {
      errorCode
      decision {
        isApproved
        state
        proposal {
          assessment {
            state
          }
        }
      }
    }
  }
`;

describe('mutations.changeProposalDecision', () => {
  it('should create a new empty proposal decision on the proposal.', async () => {
    const createDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTI=' },
      },
      'internal_decision_maker',
    );
    expect(createDecision).toMatchSnapshot();
  });

  it('should modify the proposal decision.', async () => {
    const modifyDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTI=',
          estimatedCost: 50000,
          body:
            "Je suis le body de l'article lié à la proposition sur laquelle je donne ma décision",
          authors: ['VXNlcjp1c2VyU3VwZXJ2aXNvcjI=', 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg=='],
          isApproved: true,
          isDone: false,
        },
      },
      'internal_decision_maker',
    );
    expect(modifyDecision).toMatchSnapshot();
  });

  it('should not modify the proposal decision if the refused reason is empty.', async () => {
    const modifyDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTI=',
          authors: ['VXNlcjp1c2VyU3VwZXJ2aXNvcjI=', 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg=='],
          isApproved: false,
          isDone: true,
        },
      },
      'internal_decision_maker',
    );
    expect(modifyDecision).toMatchSnapshot();
  });

  it('should create a pre-filled decision if an assessment already exist on the proposal.', async () => {
    const createDecisionWithAssessment = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTA=' },
      },
      'internal_decision_maker',
    );
    expect(createDecisionWithAssessment).toMatchSnapshot();
  });

  it('should change the related assessment state when the decision is taken.', async () => {
    const modifyDecisionWithAssessment = await graphql(
      ChangeProposalDecisionWithAssessmentMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
          isDone: true,
          isApproved: true,
        },
      },
      'internal_decision_maker',
    );
    expect(modifyDecisionWithAssessment).toMatchSnapshot();
  });
});
