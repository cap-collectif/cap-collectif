// @flow
import { type IntlShape } from 'react-intl';

type MultipleChoiceQuestion = {
  +questionChoices: ?$ReadOnlyArray<{|
    +title: string,
    +responses: {|
      +totalCount: number,
    |},
  |}>,
  +isOtherAllowed: boolean,
  +otherResponses: {|
    +totalCount: number,
  |},
  +$refType: any,
};

export const cleanMultipleChoiceQuestion = (
  multipleChoiceQuestion: MultipleChoiceQuestion,
  intl: IntlShape,
) => {
  let data =
    multipleChoiceQuestion.questionChoices &&
    multipleChoiceQuestion.questionChoices
      .filter(choice => choice.responses.totalCount > 0)
      .reduce((acc, curr) => {
        acc.push({
          name: curr.title,
          value: curr.responses.totalCount,
        });
        return acc;
      }, []);

  if (!data) {
    data = [];
  }

  if (
    multipleChoiceQuestion &&
    multipleChoiceQuestion.isOtherAllowed &&
    multipleChoiceQuestion.otherResponses &&
    multipleChoiceQuestion.otherResponses.totalCount !== 0
  ) {
    data.push({
      name: intl.formatMessage({ id: 'global.question.types.other' }),
      value:
        multipleChoiceQuestion.otherResponses && multipleChoiceQuestion.otherResponses.totalCount,
    });
  }

  return data;
};
