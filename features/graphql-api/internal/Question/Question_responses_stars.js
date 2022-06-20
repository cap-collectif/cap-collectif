const QuestionResponsesStars = /** GraphQL */ `
  query QuestionResponsesStars($questionId: ID!) {
    question: node(id: $questionId) {
      ... on Question {
        responses {
          edges {
            node {
              ... on ValueResponse {
                hasViewerStarred
              }
            }
          }
        }
      }
    }
  }
`;

const starResponseMutation = /** GraphQL */ `
  mutation StarResponseMutation($input: StarResponseInput!) {
    starResponse(input: $input) {
      error
      response {
        hasViewerStarred
      }
    }
  }
`;

const unstarResponseMutation = /** GraphQL */ `
  mutation UnstarResponseMutation($input: UnstarResponseInput!) {
    unstarResponse(input: $input) {
      error
      response {
        hasViewerStarred
      }
    }
  }
`;

describe('Internal|Question.stars', () => {
  it('fail to get stars if not project admin', async () => {
    await expect(
      graphql(
        QuestionResponsesStars,
        {
          questionId: 2,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('get stars on responses', async () => {
    await expect(
      graphql(
        QuestionResponsesStars,
        {
          questionId: 2,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fail to star a response already starred', async () => {
    const starResponse = await graphql(
      starResponseMutation,
      {
        input: {
          responseId: 'VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjM=',
        },
      },
      'internal_admin',
    );
    expect(starResponse).toMatchSnapshot();
  });
  it('fail to unstar a response not previously starred', async () => {
    const unstarResponse = await graphql(
      unstarResponseMutation,
      {
        input: {
          responseId: 'VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjU=',
        },
      },
      'internal_admin',
    );
    expect(unstarResponse).toMatchSnapshot();
  });
  it('fail to star a response on wrong id', async () => {
    const starResponse = await graphql(
      starResponseMutation,
      {
        input: {
          responseId: 'wrongId',
        },
      },
      'internal_admin',
    );
    expect(starResponse).toMatchSnapshot();
  });
  it('fail to unstar a response on wrong id', async () => {
    const unstarResponse = await graphql(
      unstarResponseMutation,
      {
        input: {
          responseId: 'wrongId',
        },
      },
      'internal_admin',
    );
    expect(unstarResponse).toMatchSnapshot();
  });

  it('star a response', async () => {
    const starResponse = await graphql(
      starResponseMutation,
      {
        input: {
          responseId: 'VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjc=',
        },
      },
      'internal_admin',
    );
    expect(starResponse).toMatchSnapshot();
  });
  it('unstar a response', async () => {
    const unstarResponse = await graphql(
      unstarResponseMutation,
      {
        input: {
          responseId: 'VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjM=',
        },
      },
      'internal_admin',
    );
    expect(unstarResponse).toMatchSnapshot();
  });
});
