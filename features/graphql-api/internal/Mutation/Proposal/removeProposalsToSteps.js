/* eslint-env jest */
import '../../../_setupDB'

const removeProposalsToSteps = /* GraphQL */ `
  mutation ($input: RemoveProposalsFromStepsInput!) {
    removeProposalsFromSteps(input: $input) {
      error
      steps {
        id
      }
      proposals {
        edges {
          node {
            id
            selections {
              step {
                id
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|remove proposals to steps', () => {
  it('Admin tries to remove an invalid proposal and receives an error', async () => {
    const response = await graphql(
      removeProposalsToSteps,
      {
        input: {
          proposalIds: ['idonotexist', 'meneither'],
          stepIds: ['U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=='],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it('Admin sends step not matching the project or not a collect step and receives an error', async () => {
    const response = await graphql(
      removeProposalsToSteps,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwx'],
          stepIds: ['collectstep1', 'selectionQuestionStepVoteClassement'],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it(' Admin wants to remove a proposal not present in a step', async () => {
    const response = await graphql(
      removeProposalsToSteps,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwx'],
          stepIds: ['U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=='],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it(' Admin remove a step from two proposals, only one having it', async () => {
    const response = await graphql(
      removeProposalsToSteps,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwx', 'UHJvcG9zYWw6cHJvcG9zYWwy'],
          stepIds: ['U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=='],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
