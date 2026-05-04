//* eslint-env jest */
const StepQuery = /* GraphQL */ `
    query StepQuery($id: ID!) {
        node(id: $id) {
            ...on Step {
                exportContributorsUrls {
                    variant
                    url
                }
                exportContributionsUrls {
                    variant
                    url
                }
                exportGroupedUrls {
                    variant
                    url
                }        
            }
            ...on ProposalStep {
                exportVotesUrls {
                    variant
                    url
                }
            }
            ...on DebateStep {
                exportVotesUrls {
                    variant
                    url
                }
            }
        }
    }
`;

const variables = {
  id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ',
  userType: 1,
  status: null,
};

describe('Internal|Step exports urls', () => {
  it('fetches export urls for DebateStep', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          ...variables,
          id: 'RGViYXRlU3RlcDpkZWJhdGVTdGVwQ2FubmFiaXM=', // debateStepCannabis
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches export urls for QuestionnaireStep', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          ...variables,
          id: 'UXVlc3Rpb25uYWlyZVN0ZXA6cXVlc3Rpb25uYWlyZXN0ZXAx', // questionnairestep1
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches export urls for ConsultationStep', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          ...variables,
          id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=', // cstep1
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches export urls for CollectStep', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          ...variables,
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx', // cstep1
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches export urls for SelectionStep', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          ...variables,
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==', // selectionstep1
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

});
