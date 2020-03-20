// @flow
import type { Questions } from '~/components/Form/Form.type';

const hasQuestionsWithJump = (questions: Questions) =>
  questions.reduce(
    (acc, question) => acc || (question && question.jumps && question.jumps.length > 0),
    false,
  );

export default hasQuestionsWithJump;
