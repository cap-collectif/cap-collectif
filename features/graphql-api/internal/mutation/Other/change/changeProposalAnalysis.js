/* eslint-env jest */
import '../../../../_setup';

const ChangeProposalAnalysisMutation = /* GraphQL*/ `
  mutation ChangeProposalAnalysisMutation($input: ChangeProposalAnalysisInput!) {
    changeProposalAnalysis(input: $input) {
      errorCode
      analysis {
        id
        analyst {
          id
        }
        responses {
          ...on MediaResponse {
            medias {
              url 
            }
          }
          ...on ValueResponse {
            formattedValue
          }
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
        responses {
          ... on MediaResponse {
            medias {
              url
            }
          }
          ... on ValueResponse {
            formattedValue
          }
        }
      }
    }
  }
`;

const responses = [
  {
    value: null,
    question: 'UXVlc3Rpb246MzA4',
  },
  {
    value: '{"labels":[],"other":null}',
    question: 'UXVlc3Rpb246MzkyNA==',
  },
  {
    value: null,
    question: 'UXVlc3Rpb246MzA5',
  },
  {
    question: 'UXVlc3Rpb246MzkyNQ==',
    value: null,
  },
  {
    value: '{"labels":[],"other":null}',
    question: 'UXVlc3Rpb246MzkyNg==',
  },
  {
    value: '{"labels":[],"other":null}',
    question: 'UXVlc3Rpb246MzkyNw==',
  },
  {
    value: '{"labels":[],"other":null}',
    question: 'UXVlc3Rpb246MzkyOA==',
  },
  {
    value: '{"labels":[],"other":null}',
    question: 'UXVlc3Rpb246MzkyOQ==',
  },
  {
    value: null,
    question: 'UXVlc3Rpb246MTM4MA==',
  },
  {
    question: 'UXVlc3Rpb246MTM4MQ==',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246MTM4Mg==',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246MTM4Mw==',
    value: null,
  },
];

describe('mutations.changeProposalAnalysis', () => {
  it("should not create the proposal's analysis when authenticated as user", async () => {
    const createAnalysis = await graphql(
      ChangeProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMTE=',
          responses: [],
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
          responses: [],
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
          responses: [
            {
              value: '{"labels":["premier choix"],"other": null}',
              question: 'TXVsdGlwbGVDaG9pY2VRdWVzdGlvbjo0OQ==',
            },
            {
              value: 'Oui biensur.',
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
          decision: 'FAVOURABLE',
          responses: [
            {
              value: '{"labels":["premier choix"],"other": null}',
              question: 'TXVsdGlwbGVDaG9pY2VRdWVzdGlvbjo0OQ==',
            },
            {
              value: 'Je suis la réponse a la question',
              question: 'U2ltcGxlUXVlc3Rpb246MTMxOA==',
            },
          ],
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

  it('should change successfully the newly created analysis with missing responses to required questions', async () => {
    const analyseCreatedAnalysis = await graphql(
      ChangeProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWxJZGY2',
          responses: responses,
        },
      },
      { email: 'jpec@cap-collectif.com', password: 'toto' },
    );
    expect(analyseCreatedAnalysis).toMatchSnapshot({
      changeProposalAnalysis: {
        analysis: {
          id: expect.any(String),
        },
      },
    });
  });

  it('should not analyse the analysis with missing required responses to required questions', async () => {
    const analyseProposalAnalysis = await graphql(
      AnalyseProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWxJZGY2',
          decision: 'FAVOURABLE',
          responses: responses,
        },
      },
      { email: 'jpec@cap-collectif.com', password: 'toto' },
    );
    expect(analyseProposalAnalysis).toMatchSnapshot({
      analyseProposalAnalysis: {
        analysis: null,
      },
    });
  });

  it('should successfully analyse the analysis with required responses to required questions', async () => {
    const analyseCreatedAnalysis = await graphql(
      AnalyseProposalAnalysisMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWxJZGY2',
          decision: 'FAVOURABLE',
          responses: [
            {
              value: null,
              question: 'UXVlc3Rpb246MzA4',
            },
            {
              value: '{"labels":[],"other":null}',
              question: 'UXVlc3Rpb246MzkyNA==',
            },
            {
              value: null,
              question: 'UXVlc3Rpb246MzA5',
            },
            {
              question: 'UXVlc3Rpb246MzkyNQ==',
              value: null,
            },
            {
              value: '{"labels":[],"other":null}',
              question: 'UXVlc3Rpb246MzkyNg==',
            },
            {
              value: '{"labels":[],"other":null}',
              question: 'UXVlc3Rpb246MzkyNw==',
            },
            {
              value: '{"labels":[],"other":null}',
              question: 'UXVlc3Rpb246MzkyOA==',
            },
            {
              value: '{"labels":[],"other":null}',
              question: 'UXVlc3Rpb246MzkyOQ==',
            },
            {
              value: null,
              question: 'UXVlc3Rpb246MTM4MA==',
            },
            {
              question: 'UXVlc3Rpb246MTM4MQ==',
              value: null,
            },
            {
              question: 'UXVlc3Rpb246MTM4Mg==',
              value: 42,
            },
            {
              question: 'UXVlc3Rpb246MTM4Mw==',
              value: 12,
            },
          ],
        },
      },
      { email: 'jpec@cap-collectif.com', password: 'toto' },
    );
    expect(analyseCreatedAnalysis).toMatchSnapshot({
      analyseProposalAnalysis: {
        analysis: {
          id: expect.any(String),
        },
      },
    });
  });
});
