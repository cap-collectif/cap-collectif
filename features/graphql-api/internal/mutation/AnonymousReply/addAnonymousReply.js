/* eslint-env jest */
import '../../../_setup'

const AddAnonymousReplyMutation = /* GraphQL*/ `
    mutation AddAnonymousReplyMutation($input: AddAnonymousReplyInput!) {
        addAnonymousReply(input: $input) {
            reply {
                __typename
                id
            }
            questionnaire {
                id
            }
            participantToken
            errorCode
        }
    }
`

const input = {
  questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlQW5vbnltb3Vz',
  responses: [
    {
      value: 'abc',
      question: 'UXVlc3Rpb246MTQwMw==',
    },
  ],
}

const propertyMatchers = {
  addAnonymousReply: {
    reply: {
      id: expect.any(String),
    },
    participantToken: expect.any(String),
  },
}

describe('mutations.addAnonymousReply', () => {
  it('should create an anonymous reply', async () => {
    const response = await graphql(
      AddAnonymousReplyMutation,
      {
        input,
      },
      'internal',
    )

    expect(response).toMatchSnapshot(propertyMatchers)
  })
})
