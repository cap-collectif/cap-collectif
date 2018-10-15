export const submitQuestion = (questions, multipleChoiceQuestions) =>
  questions.map(question => {
    const questionInput = {
      question: {
        ...question,
        kind: undefined,
        otherAllowed: question.isOtherAllowed,
        randomQuestionChoices: question.isRandomQuestionChoices,
        isOtherAllowed: undefined,
        isRandomQuestionChoices: undefined,
        jumps: question.jumps ? question.jumps : [],
      },
    };
    if (multipleChoiceQuestions.indexOf(question.type) !== -1 && question.questionChoices) {
      questionInput.question.questionChoices = question.questionChoices.map(choice => ({
        ...choice,
        kind: undefined,
        image: choice.image ? choice.image.id : null,
      }));
      if (question.jumps) {
        questionInput.question.jumps = question.jumps.map(jump => ({
          ...jump,
          origin: parseInt(jump.origin.id, 10),
          destination: parseInt(jump.destination.id, 10),
          conditions: jump.conditions
            ? jump.conditions.map(condition => ({
                ...condition,
                question: parseInt(condition.question.id, 10),
                value: condition.value.id,
              }))
            : null,
        }));
      }
    }
    return questionInput;
  });
