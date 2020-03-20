// @flow
import type { Question } from '~/components/Form/Form.type';

const getInitialValueQuestion = (question: Question) => {
  // Same value that function "formatInitialResponsesValues"
  if (question.type === 'medias' || question.type === 'ranking') {
    return [];
  }

  if (question.type === 'radio' || question.type === 'checkbox') {
    return { labels: [], other: null };
  }

  return null;
};

export default getInitialValueQuestion;
