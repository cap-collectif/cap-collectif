import { graphql } from 'react-relay';

/**
 * The fragment responsesHelper_adminQuestion can be used with the "@relay(mask: false)" option
 * on questionnaires where you need responses
 * TODO : Remove jumps and create a separate fragment ?
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

            destinationJumps {
                id
                origin {
                    id
                    title
                }
            }

            alwaysJumpDestinationQuestion {
                id
                title
                number
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
};
