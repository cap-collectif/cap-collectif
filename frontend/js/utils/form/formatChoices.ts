import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql'

export const formatChoices = (questionnaire: QuestionnaireAdminConfigurationForm_questionnaire): any => {
  const questions = questionnaire.questions.map(question => {
    if (question.__typename !== 'MultipleChoiceQuestion')
      return { ...question, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false }
    const choices =
      question.choices && question.choices.edges
        ? question.choices.edges
            .filter(Boolean)
            .map(edge => ({
              ...edge.node,
              descriptionUsingJoditWysiwyg: edge.node?.descriptionUsingJoditWysiwyg !== false,
            }))
            .filter(Boolean)
        : []
    return { ...question, choices, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false }
  })
  return { ...questionnaire, questions }
}
export default formatChoices
