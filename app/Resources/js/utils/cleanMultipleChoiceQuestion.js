export const cleanMultipleChoiceQuestion = (multipleChoiceQuestion, intl) => {
  const data = multipleChoiceQuestion.questionChoices
    .filter(choice => choice.responses.totalCount > 0)
    .reduce((acc, curr) => {
      acc.push({
        name: curr.title,
        value: curr.responses.totalCount,
      });
      return acc;
    }, []);

  if (
    data &&
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
