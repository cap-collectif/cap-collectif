/* eslint-env jest */
import '../../_setup';

const DeleteRepliesMutation = /* GraphQL*/ `
    mutation DeleteReplies(
        $input: DeleteRepliesInput!
    ) {
        deleteReplies(input: $input) {
            replyIds
        }
    }
`;

const questionnaireAnonReplyId = 'UmVwbHk6cmVwbHlRdWVzdGlvbm5haXJlQW5vbg=='; // replyQuestionnaireAnon
const questionnaireAnonReplyAnonymousId = 'UmVwbHk6cmVwbHlBbm9ueW1vdXMx'; // replyAnonymous1

const questionnaireAnonymousInput = {
  replyIds: [questionnaireAnonReplyId, questionnaireAnonReplyAnonymousId],
};

const questionnaireProjectAdminReplyId = 'UmVwbHk6cmVwbHlRdWVzdGlvbm5haXJlQW5vblBPd25lcg=='; // replyQuestionnaireAnonPOwner
const questionnaireProjectAdminReplyAnonymousId =
  'UmVwbHk6cmVwbHlBbm9uUXVlc3Rpb25uYWlyZUFub25QT3duZXI='; // replyAnonQuestionnaireAnonPOwner

const questionnaireProjectAdminInput = {
  replyIds: [questionnaireProjectAdminReplyId, questionnaireProjectAdminReplyAnonymousId],
};

describe('mutations.deleteReplies', () => {
  it('should delete reply and anon reply as admin.', async () => {
    const response = await graphql(
      DeleteRepliesMutation,
      {
        input: questionnaireAnonymousInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('should delete reply and anon reply as project owner', async () => {
    const response = await graphql(
      DeleteRepliesMutation,
      {
        input: questionnaireProjectAdminInput,
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });

  it('should throw access denied if project admin user attempt to update a reply that belongs to a project he does not own', async () => {
    await expect(
      graphql(DeleteRepliesMutation, { input: questionnaireAnonymousInput }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
