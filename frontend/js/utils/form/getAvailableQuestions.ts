import { $Shape } from 'utility-types'
import type { FormattedQuestion } from '~/utils/form/formatQuestions'

type QuestionWithCountOfParent = Record<string, number>

const getAvailableQuestions = (questions: Array<FormattedQuestion>): Array<string> => {
  // All questions linked to jump (its a child question)
  const childrenOfQuestion = questions
    .map(question => [...question.questionsToDisplay, ...question.questionsNotDisplay])
    .flatMap(q => q)

  /**
   * Get count of parent for a question
   *
   * Formatted as:
   * [child]: number of parent
   */
  const cleanUniqueChildrenOfQuestion: Array<string> = [...new Set(childrenOfQuestion)]
  const childWithParent = cleanUniqueChildrenOfQuestion.reduce(
    (acc: QuestionWithCountOfParent | $Shape<{}>, item: string) => ({
      ...acc,
      [item]: questions.filter(q => q.questionsToDisplay.includes(item)).length,
    }),
    {},
  )
  const availableQuestions = questions.map(q => {
    const parents = childWithParent[q.id]
    // Display child which has a parent display
    if (parents > 0) return q.id
    // Orphan question THEN independent THEN display
    if (typeof parents === 'undefined') return q.id

    // No parents THEN don't display question THEN delete his children
    if (parents === 0) {
      if (q.questionsToDisplay && q.questionsToDisplay.length > 0) {
        q.questionsToDisplay.forEach(child => {
          childWithParent[child] -= 1
        })
      }
    }
  })
  return availableQuestions.filter(Boolean)
}

export default getAvailableQuestions
