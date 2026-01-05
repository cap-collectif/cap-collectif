import '../../../_setup'

const AddReplyMutation = /* GraphQL */ `
  mutation ($input: AddUserReplyInput!) {
    addUserReply(input: $input) {
      reply {
        id
        published
        completionStatus
        responses {
          question {
            id
          }
          ... on ValueResponse {
            value
          }
        }
      }
      questionnaire {
        id
      }
      errorCode
    }
  }
`

describe('mutations.addUserReplyMutation', () => {
  it('User wants to add a reply', async () => {
    await expect(
      graphql(
        AddReplyMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
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
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addUserReply: {
        reply: {
          id: expect.any(String),
        },
      },
    })
  })

  it('User wants to add an answer without fulfilling the requirements, it should set completionStatus to MISSING_REQUIREMENTS', async () => {
    await expect(
      graphql(
        AddReplyMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw==',
            draft: false,
            responses: [
              {
                question: 'UXVlc3Rpb246Mzk0NQ==',
                value: '{"labels":["Nom"]}',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addUserReply: {
        reply: {
          id: expect.any(String),
        },
      },
    })
  })
})
