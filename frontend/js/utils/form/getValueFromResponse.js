// @flow
import invariant from '~/utils/invariant';
import type { QuestionType } from '~/components/Form/Form.type';

export const getValueFromResponse = (questionType: QuestionType, responseValue: string) => {
  // For some questions type we need to parse the JSON of previous value
  try {
    if (questionType === 'select') {
      // Here, we are dealing with a select question that uses `react-select`.
      // React select option choice must have the shape { value: xxx, label: xxx } in Redux to work
      // See https://www.firehydrant.io/blog/using-react-select-with-redux-form/ (part: `Other Gotchas`)
      return {
        label: responseValue,
        value: responseValue,
      };
    }
    if (questionType === 'number') {
      return Number(responseValue);
    }
    if (questionType === 'button') {
      return JSON.parse(responseValue).labels[0];
    }
    if (questionType === 'radio' || questionType === 'checkbox') {
      return JSON.parse(responseValue);
    }
    if (questionType === 'ranking') {
      return JSON.parse(responseValue).labels;
    }
  } catch (e) {
    invariant(false, `Failed to parse: ${responseValue}`);
  }

  return responseValue;
};

export default getValueFromResponse;
