import { graphql } from 'react-relay'

/**
 * The fragment responsesHelper_adminQuestion can be used with the "@relay(mask: false)" option
 * on questionnaires where you need responses
 */
export const QuestionAdminFragment = {
  adminQuestion: graphql`
    fragment responsesHelper_adminQuestion on Question {
      __typename
      id
      title
      number
      private
      position
      required
      hidden
      helpText
      ... on SectionQuestion {
        level
      }
      ... on SimpleQuestion {
        isRangeBetween
        rangeMin
        rangeMax
      }

      description
      descriptionUsingJoditWysiwyg
      type
      ... on MultipleChoiceQuestion {
        otherAllowed: isOtherAllowed
        randomQuestionChoices
        groupedResponsesEnabled
        responseColorsDisabled
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
              descriptionUsingJoditWysiwyg
              color
              image {
                id
                url
                type: contentType
              }
            }
          }
        }
      }
    }
  `,
}
