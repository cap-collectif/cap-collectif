/* eslint-env jest */
import '../../../_setupDB'

const addProposalsToSteps = /* GraphQL */ `
  mutation ($input: AddProposalsToStepsInput!) {
    addProposalsToSteps(input: $input) {
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
              status {
                id
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|add proposals to steps', () => {
  it('Admin tries to add an invalid proposal and receives an error', async () => {
    const response = await graphql(
      addProposalsToSteps,
      {
        input: {
          proposalIds: ['idonotexist', 'meneither'],
          stepIds: ['U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=='],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it('Admin sends step not matching the project or not a collect step and receives an error', async () => {
    const response = await graphql(
      addProposalsToSteps,
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

  it('Admin add an already present step to a proposal', async () => {
    const response = await graphql(
      addProposalsToSteps,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwx'],
          stepIds: ['U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=='],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  it('Admin add a step to two proposals, one already having it. The new step has default status', async () => {
    const response = await graphql(
      addProposalsToSteps,
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
