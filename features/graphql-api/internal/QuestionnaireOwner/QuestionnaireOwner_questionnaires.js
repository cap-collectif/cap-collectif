/* eslint-env jest */
const QuestionnaireOwnerQuestionnairesQuery = /* GraphQL */ `
  query QuestionnaireOwnerQuestionnairesQuery($affiliations: [QuestionnaireAffiliation!]) {
    viewer {
      questionnaires(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            title
            id
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const QuestionnaireOwnerQuestionnaireQueryFilterByQuery = /* GraphQL */ `
  query QuestionnaireOwnerQuestionnaireQueryFilterByQuery(
    $affiliations: [QuestionnaireAffiliation!]
    $query: String
  ) {
    viewer {
      questionnaires(affiliations: $affiliations, query: $query) {
        totalCount
        edges {
          node {
            id
            title
            createdAt
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const QuestionnaireOwnerQuestionnaireQueryOrderBy = /* GraphQL */ `
  query QuestionnaireOwnerQuestionnaireQueryOrderBy(
    $affiliations: [QuestionnaireAffiliation!]
    $orderBy: QuestionnaireOrder
  ) {
    viewer {
      questionnaires(affiliations: $affiliations, orderBy: $orderBy) {
        totalCount
        edges {
          node {
            id
            title
            createdAt
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const QuestionnaireOwnerQuestionnaireQueryOnlyAvailables = /* GraphQL */ `
  query QuestionnaireOwnerQuestionnaireQueryOnlyAvailables($onlyAvailables: Boolean) {
    viewer {
      questionnaires(onlyAvailables: $onlyAvailables) {
        totalCount
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`;

describe('Internal.viewer.questionnaires', () => {
  it('should correctly fetch questionnaires that a user owns when given the `OWNER` affiliations', async () => {
    const response = await graphql(
      QuestionnaireOwnerQuestionnairesQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.questionnaires.totalCount).toBe(2);
    expect(response.viewer.questionnaires.edges).toHaveLength(2);
    expect(response.viewer.questionnaires.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should correctly fetch all questionnaires if no affiliations given.', async () => {
    const response = await graphql(
      QuestionnaireOwnerQuestionnairesQuery,
      {
        affiliations: null,
      },
      'internal_theo',
    );

    expect(response.viewer.questionnaires.totalCount).toBe(21);
    expect(response.viewer.questionnaires.edges).toHaveLength(21);
  });

  it('should correctly filter questionnaires by a given `query`', async () => {
    const response = await graphql(
      QuestionnaireOwnerQuestionnaireQueryFilterByQuery,
      {
        affiliations: ['OWNER'],
        query: 'Questionnaire visible',
      },
      'internal_theo',
    );

    expect(response.viewer.questionnaires.totalCount).toBe(1);
    expect(response.viewer.questionnaires.edges).toHaveLength(1);
    expect(response.viewer.questionnaires.edges[0].node.title).toBe(
      'Questionnaire visible par un owner',
    );
  });

  it('should correctly fetch all questionnaires if given `query` is empty', async () => {
    const response = await graphql(
      QuestionnaireOwnerQuestionnaireQueryFilterByQuery,
      {
        affiliations: ['OWNER'],
        query: '',
      },
      'internal_theo',
    );

    expect(response.viewer.questionnaires.totalCount).toBe(2);
    expect(response.viewer.questionnaires.edges).toHaveLength(2);
  });

  it('should correctly order questionnaires by a given field and direction', async () => {
    const response = await graphql(
      QuestionnaireOwnerQuestionnaireQueryOrderBy,
      {
        affiliations: ['OWNER'],
        orderBy: { field: 'CREATED_AT', direction: 'ASC' },
      },
      'internal_theo',
    );

    expect(response.viewer.questionnaires.totalCount).toBe(2);
    expect(response.viewer.questionnaires.edges).toHaveLength(2);

    expect(response.viewer.questionnaires.edges[0].node.createdAt).toBe('2019-09-11 00:00:00');
    expect(response.viewer.questionnaires.edges[1].node.createdAt).toBe('2020-09-11 00:00:00');
  });

  it('should correctly fetch all available questionnaires.', async () => {
    await expect(
      graphql(
        QuestionnaireOwnerQuestionnaireQueryOnlyAvailables,
        {
          onlyAvailables: true,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
