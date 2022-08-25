// @flow

export const getAvailabeQuestionsCacheKey = (questionnaireId?: string | null): string =>
  `availableQuestions${questionnaireId || ''}`;
