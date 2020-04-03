// @flow
import { graphql } from 'react-relay';

/* Need these fragments in other components but eslint doesn't appreciate
 * that they're not used here */

/* eslint-disable */
export const MULTIPLE_QUESTION_CHOICES_SEARCH_QUERY = graphql`
  query responsesHelper_MultipleQuestionChoicesSearchQuery($questionId: ID!, $term: String!) {
    node(id: $questionId) {
      ... on MultipleChoiceQuestion {
        choices(term: $term) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`;

const ResponseFragment = {
  response: graphql`
    fragment responsesHelper_response on Response {
      question {
        id
      }
      ... on ValueResponse {
        value
      }
      ... on MediaResponse {
        medias {
          id
          name
          size
          url
        }
      }
    }
  `,
};

/**
 * Ok we have two shared fragment for questions :
 * - responsesHelper_adminQuestion
 * - responsesHelper_question
 *
 * Because we need different configurations depending on frontend or backend…
 * We could use a variable (eg: isOnAdmin)
 * But this is currently not supported on shared fragment:
 * https://github.com/facebook/relay/issues/2118
 */

const QuestionAdminFragment = {
  adminQuestion: graphql`
    fragment responsesHelper_adminQuestion on Question {
      __typename
      id
      title
      number
      private
      position
      required
      helpText
      jumps(orderBy: { field: POSITION, direction: ASC }) {
        id
        origin {
          id
        }
        destination {
          id
          title
          number
        }
        conditions {
          id
          operator
          question {
            id
            title
            type
          }
          ... on MultipleChoiceQuestionLogicJumpCondition {
            value {
              id
              title
            }
          }
        }
      }
      alwaysJumpDestinationQuestion {
        id
        title
        number
      }
      description
      type
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        randomQuestionChoices
        validationRule {
          type
          number
        }
        choices(allowRandomize: false) {
          pageInfo {
            hasNextPage
          }
          # this is updated
          totalCount
          edges {
            node {
              id
              title
              description
              color
              image {
                id
                url
              }
            }
          }
        }
      }
    }
  `,
};

const QuestionFragment = {
  question: graphql`
    fragment responsesHelper_question on Question {
      __typename
      id
      title
      number
      private
      position
      required
      helpText
      jumps(orderBy: { field: POSITION, direction: ASC }) {
        id
        origin {
          id
        }
        destination {
          id
          title
          number
        }
        conditions {
          id
          operator
          question {
            id
            title
            type
          }
          ... on MultipleChoiceQuestionLogicJumpCondition {
            value {
              id
              title
            }
          }
        }
      }
      alwaysJumpDestinationQuestion {
        id
        title
        number
      }
      description
      type
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        randomQuestionChoices
        validationRule {
          type
          number
        }
        choices(allowRandomize: true) {
          pageInfo {
            hasNextPage
          }
          totalCount
          edges {
            node {
              id
              title
              description
              color
              image {
                id
                url
              }
            }
          }
        }
      }
    }
  `,
};
/* eslint-enable */
