/* eslint-env jest */
import '../../../_setup';

const AddAnonymousReplyMutation = /* GraphQL*/ `
    mutation AddAnonymousReplyMutation($input: AddAnonymousReplyInput!) {
        addAnonymousReply(input: $input) {
            reply {
                __typename
                id
                participantEmail
            }
            questionnaire {
                id
            }
            token
        }
    }
`;

const input = {
  "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlQW5vbnltb3Vz",
  "responses": [
    {
      "value": "abc",
      "question": "UXVlc3Rpb246MTQwMw=="
    }
  ],
  "participantEmail": null
};

const propertyMatchers = {
  addAnonymousReply: {
    reply: {
      id: expect.any(String)
    },
    token: expect.any(String)
  },
}

describe('mutations.addAnonymousReply', () => {
  it('should create an anonymous reply', async () => {
    const response = await graphql(
      AddAnonymousReplyMutation,
      {
        input,
      },
      'internal'
    );

    expect(response).toMatchSnapshot(propertyMatchers);
  });

  it('should create an anonymous reply with participantEmail', async () => {
    const response = await graphql(
      AddAnonymousReplyMutation,
      {
        input: {
          ...input,
          participantEmail: 'abc@cap-collectif.com'
        }
      },
      'internal'
    );

    expect(response).toMatchSnapshot(propertyMatchers);
  });
});
