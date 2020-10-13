// @flow
import type {
  Questions,
  ResponsesInReduxForm,
  SubmitResponses,
  Media,
} from '~/components/Form/Form.type';
import getAvailableQuestionsIds from '~/utils/form/getAvailableQuestionsIds';
import type { ReactSelectValue } from '~/components/Form/Select';

export const formatSubmitResponses = (
  responses: ResponsesInReduxForm,
  questions: Questions,
): SubmitResponses => {
  if (!responses) return [];

  const answeredQuestionsIds = getAvailableQuestionsIds(questions, responses);

  return responses.map(res => {
    const question = questions.filter(q => res.question === q.id)[0];
    const { type: questionType } = question;

    if (questionType === 'medias') {
      const mediaResponses = ((res.value: any): $ReadOnlyArray<Media>);
      const medias = answeredQuestionsIds.includes(question.id)
        ? Array.isArray(mediaResponses)
          ? mediaResponses.map((value: Media) => value.id)
          : []
        : null;

      return {
        question: res.question,
        medias,
      };
    }

    let { value } = res;

    if (questionType === 'select') {
      // Here, we are dealing with a select question that uses `react-select`.
      // React select option choice must have the shape { value: xxx, label: xxx } in Redux to work
      // See https://www.firehydrant.io/blog/using-react-select-with-redux-form/ (part: `Other Gotchas`)
      return {
        question: res.question,
        value: value ? ((value: any): ReactSelectValue).value : null,
      };
    }

    if (questionType === 'ranking' || questionType === 'button') {
      value = answeredQuestionsIds.includes(question.id)
        ? JSON.stringify({
            labels: Array.isArray(res.value) ? res.value : [res.value].filter(Boolean),
            other: null,
          })
        : null;
    } else if (questionType === 'checkbox' || questionType === 'radio') {
      value = answeredQuestionsIds.includes(question.id) ? JSON.stringify(res.value) : null;
    } else if (questionType === 'number' || questionType === 'majority') {
      return {
        question: res.question,
        value: res.value,
      };
    }

    if (typeof value === 'string') {
      value = answeredQuestionsIds.includes(question.id) ? value : null;
      return { value, question: res.question };
    }
    // eslint-disable-next-line no-console
    console.warn('Your questionType may not be recognized. Please check formatSubmitResponses.');
    return { value: null, question: res.question };
  });
};

export default formatSubmitResponses;
