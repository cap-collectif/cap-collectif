/* eslint-env jest */
import '../../../_setupDB'

const UpdateCollectStep = /* GraphQL*/ `
    mutation UpdateCollectStepMutation($input: UpdateCollectStepInput!) {
      updateCollectStep(input: $input) {
        collectStep {
          preventProposalDelete
          preventProposalEdit
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
          private
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
`

// Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx
const stepId = toGlobalId('CollectStep', 'collectstep1')
const proposalFormId = 'proposalForm1'

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
  proposalForm: proposalFormId,
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
  proposalArchivedTime: 0,
  proposalArchivedUnitTime: 'MONTHS',
  isCollectByEmailEnabled: false,
  preventProposalDelete: true,
  preventProposalEdit: true,
}

describe('mutations.updateCollectStep', () => {
  it('admin should be able to edit collectStep step.', async () => {
    const response = await graphql(UpdateCollectStep, { input: { ...input } }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
})
