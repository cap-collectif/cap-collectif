/* eslint-env jest */
import '../../_setup';

const UpdateSelectionStep = /* GraphQL*/ `
    mutation UpdateSelectionStepMutation($input: UpdateSelectionStepInput!) {
      updateSelectionStep(input: $input) {
        selectionStep {
          id
          title
          label
          body
          bodyUsingJoditWysiwyg
          timeless
          timeRange {
            startAt
            endAt
          }
          enabled
          customCode
          metaDescription
          allowAuthorsToAddNews
          defaultSort
          mainView
          defaultStatus {
            name
          }
          statuses {
            name
          }
          votesHelpText
          votesLimit
          votesMin
          votesRanking
          voteThreshold
          publishedVoteDate
          voteType
          budget
          isProposalSmsVoteEnabled
          requirements {
            reason
            edges {
              node {
                __typename
              }
            }
          }
          isSecretBallot
        }
      }
    }
`;

// U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==
const stepId = toGlobalId('SelectionStep', 'selectionstep1');

const input = {
  stepId: stepId,
  label: 'upated label',
  body: 'updated body',
  bodyUsingJoditWysiwyg: true,
  timeless: true,
  startAt: '2024-03-30 11:22:00',
  endAt: '2024-05-30 11:22:00',
  customCode: 'updated custom code',
  metaDescription: 'updated metadescription',
  isEnabled: true,
  allowAuthorsToAddNews: true,
  defaultSort: 'OLD',
  mainView: 'LIST',
  defaultStatus: null,
  statuses: [
    {
      name: 'status',
      color: 'PRIMARY',
    },
  ],
  votesHelpText: 'help text',
  votesLimit: 20,
  votesMin: 1,
  votesRanking: true,
  voteThreshold: 30,
  publishedVoteDate: null,
  voteType: 'DISABLED',
  budget: 30000,
  isProposalSmsVoteEnabled: false,
  requirements: [
    {
      type: 'FIRSTNAME',
    },
    {
      type: 'LASTNAME',
    },
  ],
  requirementsReason: null,
  secretBallot: false,
};

describe('mutations.updateSelectionStep', () => {
  it('admin should be able to edit selectionStep step.', async () => {
    const response = await graphql(UpdateSelectionStep, { input: { ...input } }, 'internal_admin');
    expect(response).toMatchSnapshot();
  });

  it('should override requirements with phone and phone_verified if sms vote is enabled.', async () => {
    const response = await graphql(
      UpdateSelectionStep,
      { input: { ...input, isProposalSmsVoteEnabled: true } },
      'internal_admin',
    );

    const requirements = response.updateSelectionStep.selectionStep.requirements.edges;
    expect(requirements).toStrictEqual([
      { node: { __typename: 'PhoneRequirement' } },
      { node: { __typename: 'PhoneVerifiedRequirement' } },
    ]);
  });
});
