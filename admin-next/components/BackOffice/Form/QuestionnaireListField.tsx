import * as React from 'react'
import { graphql } from 'react-relay'
import type {
  QuestionnaireListFieldQuery,
  QuestionnaireListFieldQuery$data,
} from '@relay/QuestionnaireListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'

interface QuestionnaireListFieldProps extends Omit<BaseField, 'onChange'>, Omit<FieldSelect, 'type'> {
  questionnaireIdsToNoSearch?: string[]
  authorOfEvent?: boolean
}

type QuestionnaireListFieldValue = {
  label: string
  value: string
}

const getQuestionnaireList = graphql`
  query QuestionnaireListFieldQuery(
    $term: String
    $affiliations: [QuestionnaireAffiliation!]
    $types: [QuestionnaireType]
  ) {
    viewer {
      questionnaires(query: $term, affiliations: $affiliations, availableOnly: false, types: $types) {
        edges {
          node {
            id
            title

            description
            questions {
              id
              ...responsesHelper_adminQuestion @relay(mask: false)
            }
            questionsWithJumps: questions(filter: JUMPS_ONLY) {
              id
              title
              jumps(orderBy: { field: POSITION, direction: ASC }) {
                id
                origin {
                  id
                  title
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
              # unused for now, will be usefull when we'll add error and warning messages
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
            }
          }
        }
      }
      organizations {
        questionnaires(query: $term, affiliations: $affiliations, availableOnly: true, types: $types) {
          edges {
            node {
              id
              title
              description
              questions {
                id
                ...responsesHelper_adminQuestion @relay(mask: false)
              }
              questionsWithJumps: questions(filter: JUMPS_ONLY) {
                id
                title
                jumps(orderBy: { field: POSITION, direction: ASC }) {
                  id
                  origin {
                    id
                    title
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
                # unused for now, will be usefull when we'll add error and warning messages
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
              }
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const formatQuestionnairesData = (
  // @ts-ignore
  questionnaires: QuestionnaireListFieldQuery$data['questionnaireSearch'],
) => {
  if (!questionnaires) return []

  return questionnaires.map(questionnaire => {
    if (questionnaire) {
      const { id, title } = questionnaire
      return {
        value: id,
        label: title,
        questionnaire,
      }
    }
  })
}

export const QuestionnaireListField: React.FC<QuestionnaireListFieldProps> = ({ name, control, ...props }) => {
  const loadOptions = async (search: string): Promise<QuestionnaireListFieldValue[]> => {
    const questionnairesData = await fetchQuery<QuestionnaireListFieldQuery>(environment, getQuestionnaireList, {
      term: search,
      affiliations: null,
      types: ['QUESTIONNAIRE', 'VOTING'],
    }).toPromise()

    const questionnairesEdges =
      questionnairesData?.viewer.organizations?.[0]?.questionnaires?.edges ??
      questionnairesData?.viewer.questionnaires?.edges

    if (questionnairesEdges) {
      return formatQuestionnairesData(questionnairesEdges.map(e => ({ ...e.node })))
    }

    return []
  }

  return (
    // @ts-ignore
    <FieldInput {...props} type="select" control={control} name={name} defaultOptions loadOptions={loadOptions} />
  )
}

export default QuestionnaireListField
