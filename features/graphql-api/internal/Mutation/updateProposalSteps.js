import '../../_setupDB'

const ChangeProposalProgressStepsMutation = /* GraphQL */ `
  mutation ChangeProposalProgressStepsMutation($input: ChangeProposalProgressStepsInput!) {
    changeProposalProgressSteps(input: $input) {
      proposal {
        id
        progressSteps {
          title
          startAt
          endAt
        }
      }
    }
  }
`

const input = {
  proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
  progressSteps: [
    {
      title: 'test',
      startAt: '2018-03-07 00:00:00',
      endAt: '2018-03-16 00:00:00',
    },
  ],
}

const inputProgressStepsEmpty = {
  proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
  progressSteps: [],
}

describe('mutations.changeProposalProgressStepsMutation', () => {
  it('should create and delete a proposal step in admin as admin', async () => {
    await expect(
      graphql(ChangeProposalProgressStepsMutation, { input: input }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
    await expect(
      graphql(ChangeProposalProgressStepsMutation, { input: inputProgressStepsEmpty }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
