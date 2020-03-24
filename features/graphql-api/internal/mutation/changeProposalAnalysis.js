/* eslint-env jest */
import '../../_setup';

const ChangeProposalAnalysisMutation = /* GraphQL*/ `
  mutation ChangeProposalAnalysisMutation($input: ChangeProposalAnalysisInput!) {
    changeProposalAnalysis(input: $input) {
      errorCode
      analysis {
        id
        comment
        updatedBy {
          id
        }
      }
    }
  }
`;

const AnalyseProposalAnalysisMutation = /* GraphQL */ `
  mutation AnalyseProposalAnalysis($input: AnalyseProposalAnalysisInput!) {
    analyseProposalAnalysis(input: $input) {
      errorCode
      analysis {
        state
        id
        comment
      }
    }
  }
`;

describe('mutations.changeProposalAnalysis', () => {
  it("should not create the proposal's analysis when authenticated as user", async () => {
    const createAnalysis = await graphql(
      ChangeProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTE=',
        },
      },
      'internal_user',
    );
    expect(createAnalysis).toMatchSnapshot();
  });

  it("should not create the proposal's analysis if the decision has already been given", async () => {
    const createAnalysis = await graphql(
      ChangeProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTU=',
        },
      },
      'internal_analyst',
    );
    expect(createAnalysis).toMatchSnapshot();
  });

  it("should create successfully the proposal's analysis", async () => {
    const createAnalysis = await graphql(
      ChangeProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTE=',
          comment: 'caca',
          responses: [
            {
              value: '{"labels":["premier choix"],"other": null}',
              question: 'TXVsdGlwbGVDaG9pY2VRdWVzdGlvbjo0OQ==',
            },
            {
              value: 'caca',
              question: 'U2ltcGxlUXVlc3Rpb246MTMxOA==',
            },
          ],
        },
      },
      'internal_analyst',
    );
    expect(createAnalysis).toMatchSnapshot({
      changeProposalAnalysis: {
        analysis: {
          id: expect.any(String),
        },
      },
    });
  });

  it("should analyse successfully the proposal's analysis", async () => {
    const analyseAnalysis = await graphql(
      AnalyseProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTE=',
          comment: 'caca',
          decision: 'FAVOURABLE',
        },
      },
      'internal_analyst',
    );
    expect(analyseAnalysis).toMatchSnapshot({
      analyseProposalAnalysis: {
        analysis: {
          id: expect.any(String),
        },
      },
    });
  });
});
