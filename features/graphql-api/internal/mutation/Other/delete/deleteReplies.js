/* eslint-env jest */
import '../../../../_setup';

const DeleteRepliesMutation = /* GraphQL*/ `
    mutation DeleteReplies(
        $input: DeleteRepliesInput!
    ) {
        deleteReplies(input: $input) {
            replyIds
        }
    }
`;

const QuestionnaireCountQuery = /* GraphQL */ `
  query QuestionnaireCountQuery($id: ID!) {
    node(id: $id) {
      ... on Project {
        contributors {
          totalCount
        }
        contributions {
          totalCount
        }
      }
    }
  }
`;

// UHJvamVjdDpwcm9qZWN0V2l0aEFub255bW91c1F1ZXN0aW9ubmFpcmU= -> Project:projectWithAnonymousQuestionnaire
const questionnaireAnonymousInput = {
  replyIds: [
    'UmVwbHk6cmVwbHlBbm9ueW1vdXMx', // Reply:replyAnonymous1
    'UmVwbHk6cmVwbHlRdWVzdGlvbm5haXJlQW5vbg==', // Reply:replyQuestionnaireAnon
  ],
};

// UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy -> Project:projectWithOwner
const questionnaireProjectAdminInput = {
  replyIds: [
    'UmVwbHk6cmVwbHlRdWVzdGlvbm5haXJlQW5vblBPd25lcg==', // Reply:replyQuestionnaireAnonPOwner
    'UmVwbHk6cmVwbHlBbm9uUXVlc3Rpb25uYWlyZUFub25QT3duZXI=', // Reply:replyAnonQuestionnaireAnonPOwner
  ],
};

describe('mutations.deleteReplies', () => {
  it('should delete reply and anon reply as admin.', async () => {
    let countResponse = await graphql(
      QuestionnaireCountQuery,
      { id: 'UHJvamVjdDpwcm9qZWN0V2l0aEFub255bW91c1F1ZXN0aW9ubmFpcmU=' },
      'internal_admin',
    );
    const nbContributors = countResponse.node.contributors.totalCount;
    const nbContributions = countResponse.node.contributions.totalCount;

    const response = await graphql(
      DeleteRepliesMutation,
      {
        input: questionnaireAnonymousInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
    countResponse = await graphql(
      QuestionnaireCountQuery,
      { id: 'UHJvamVjdDpwcm9qZWN0V2l0aEFub255bW91c1F1ZXN0aW9ubmFpcmU=' },
      'internal_admin',
    );

    // TODO : there is a bug, the number of contributions is correct
    //  but the number of contributors does not take into account anonymous replies
    //  (but) it seems to work if the user deleting the reply is the owner of the questionnaire
    expect(countResponse.node.contributors.totalCount).toBe(nbContributors - 1);
    expect(countResponse.node.contributions.totalCount).toBe(nbContributions - 2);
  });

  it('should delete reply and anon reply as project owner', async () => {
    let countResponse = await graphql(
      QuestionnaireCountQuery,
      { id: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy' },
      'internal_theo',
    );
    const nbContributors = countResponse.node.contributors.totalCount;
    const nbContributions = countResponse.node.contributions.totalCount;

    const response = await graphql(
      DeleteRepliesMutation,
      {
        input: questionnaireProjectAdminInput,
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
    countResponse = await graphql(
      QuestionnaireCountQuery,
      { id: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy' },
      'internal_theo',
    );

    expect(countResponse.node.contributors.totalCount).toBe(nbContributors - 2);
    expect(countResponse.node.contributions.totalCount).toBe(nbContributions - 2);
  });

  it('should throw access denied if project admin user attempt to update a reply that belongs to a project he does not own', async () => {
    await expect(
      graphql(DeleteRepliesMutation, { input: questionnaireAnonymousInput }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
