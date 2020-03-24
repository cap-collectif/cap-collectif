// @flow
import formatResponses from '~/utils/form/formatResponses';
import formatQuestions from '~/utils/form/formatQuestions';
import getAvailableQuestions from '~/utils/form/getAvailableQuestions';
import hasQuestionsWithJump from '~/utils/form/hasQuestionsWithJump';
import type { Questions, ResponsesInReduxForm } from '~/components/Form/Form.type';

const getAvailableQuestionsIds = (
  questions: Questions,
  responses: ResponsesInReduxForm,
): Array<string> => {
  const hasLogicJumps = hasQuestionsWithJump(questions);

  if (!hasLogicJumps) return questions.map(q => q.id);

  const formattedResponses = formatResponses(questions, responses);
  const formattedQuestions = formatQuestions(questions, formattedResponses);

  return getAvailableQuestions(formattedQuestions);
};

export default getAvailableQuestionsIds;
