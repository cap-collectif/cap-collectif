import getInitialValueQuestion from '~/utils/form/getInitialValueQuestion'
import type { Question, ResponsesInReduxForm, Questions } from '~/components/Form/Form.type'

const resetNotAvailableQuestions = (
  questions: Questions,
  responses: ResponsesInReduxForm,
  availableQuestions: Array<string>,
  change: (field: string, value: any) => void,
) => {
  const notAvailableQuestions: Array<string> = questions
    .filter(question => !availableQuestions.includes(question.id))
    .map(question => question.id)
  notAvailableQuestions.forEach((notAvailableQuestion: string) => {
    const indexQuestion = questions.findIndex((q: Question) => q.id === notAvailableQuestion)

    if (indexQuestion > -1) {
      const question = questions[indexQuestion]
      const responseCurrentQuestion =
        responses && responses.find(({ question: answeredQuestion }) => answeredQuestion === notAvailableQuestion)

      // reset value of question not display
      if (responseCurrentQuestion && getInitialValueQuestion(question) !== responseCurrentQuestion.value) {
        change(`responses[${indexQuestion}].value`, getInitialValueQuestion(question))
      }
    }
  })
}

export default resetNotAvailableQuestions
