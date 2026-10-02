import '../../../_setupDB'

const UpdateUserReplyMutation = /* GraphQL */ `
  mutation UpdateUserReplyMutation($input: UpdateUserReplyInput!) {
    updateUserReply(input: $input) {
      reply {
        id
        published
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
        }
      }
    }
  }
`

const input = {
  replyId: 'UmVwbHk6cmVwbHky',
  draft: false,
  responses: [
    {
      question: 'UXVlc3Rpb246Mg==',
      value: "Je pense que c'est la ville parfaite pour organiser les JO",
    },
    {
      question: 'UXVlc3Rpb246MTM=',
      value: '{"labels":["Athlétisme","Sports collectifs"],"other":"Embêter Maxime"}',
    },
  ],
}

const inputDraft = {
  replyId: 'UmVwbHk6cmVwbHk5',
  draft: false,
  responses: [
    {
      question: 'UXVlc3Rpb246Mg==',
      value: "Je pense que c'est la ville parfaite pour organiser les JO",
    },
    {
      question: 'UXVlc3Rpb246MTM=',
      value: '{"labels":["Athlétisme","Sports collectifs"],"other":"Embêter Maxime"}',
    },
  ],
}
/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.updateUserReplyMutation', () => {
  it('wants to update reply as admin', async () => {
    await expect(graphql(UpdateUserReplyMutation, { input: input }, 'internal_admin')).resolves.toMatchSnapshot()
  })
  it('wants to published a reply in draft as admin', async () => {
    await expect(graphql(UpdateUserReplyMutation, { input: inputDraft }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
