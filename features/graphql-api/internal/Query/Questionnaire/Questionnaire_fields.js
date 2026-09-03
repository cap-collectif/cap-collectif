/* eslint-env jest */

import '../../../_setupES'

const QuestionnaireQuestionsQuery = /* GraphQL */ `
  query QuestionnaireQuestionsQuery($questionnaireId: ID!) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        questions {
          id
        }
      }
    }
  }
`

const QuestionnaireViewerRepliesQuery = /* GraphQL */ `
  query QuestionnaireViewerRepliesQuery($questionnaireId: ID!) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        viewerReplies {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

const QuestionnaireParticipantsWithNotConfirmedUsersQuery = /* GraphQL */ `
  query QuestionnaireParticipantsWithNotConfirmedUsersQuery($questionnaireId: ID!) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        participants {
          totalCount
        }
        questions {
          id
          participants(withNotConfirmedUser: true) {
            totalCount
          }
        }
      }
    }
  }
`

const QuestionnaireParticipantsQuery = /* GraphQL */ `
  query QuestionnaireParticipantsQuery($questionnaireId: ID!) {
    questionnaire: node(id: $questionnaireId) {
      ... on Questionnaire {
        participants {
          totalCount
        }
        questions {
          id
          participants {
            totalCount
          }
        }
      }
    }
  }
`

const questionnaireId = 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ=='

describe('Internal|Questionnaire fields', () => {
  it('returns questionnaire questions', async () => {
    await expect(
      graphql(QuestionnaireQuestionsQuery, { questionnaireId }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })

  it('returns the current user replies', async () => {
    await expect(
      graphql(QuestionnaireViewerRepliesQuery, { questionnaireId }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('returns question participants including unconfirmed users', async () => {
    await expect(
      graphql(QuestionnaireParticipantsWithNotConfirmedUsersQuery, { questionnaireId }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })

  it('returns question participants', async () => {
    await expect(
      graphql(QuestionnaireParticipantsQuery, { questionnaireId }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })

  it('returns participants for an anonymous questionnaire', async () => {
    await expect(
      graphql(
        QuestionnaireParticipantsQuery,
        { questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlQW5vbnltb3Vz' },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
