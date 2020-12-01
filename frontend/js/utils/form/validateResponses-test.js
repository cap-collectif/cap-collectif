// @flow
import validateResponses from '~/utils/form/validateResponses';
import getAvailableQuestionsIds from '~/utils/form/getAvailableQuestionsIds';
import {
  allTypeQuestions,
  allTypeResponses,
  allTypeQuestionsWithRule,
  allTypeResponsesWithError,
} from './mocks';
import { intlMock } from '~/mocks';

const allRequiredQuestions = allTypeQuestions.map(q => ({ ...q, required: true }));
const allNotRequiredQuestions = allTypeQuestions.map(q => ({ ...q, required: false }));

const noErrorResponses = {
  responses: [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ],
};

const errorResponses = {
  responses: [
    undefined,
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ],
};

const allTypeErrorResponses = {
  responses: [
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
    {
      value: 'please-enter-a-number',
    },
    {
      value: 'reply.constraints.choices_equal',
    },
    {
      value: 'reply.constraints.choices_min',
    },
    {
      value: 'reply.constraints.choices_max',
    },
    {
      value: 'reply.constraints.field_mandatory',
    },
  ],
};

describe('validateResponses', () => {
  it('should work correctly with all questions required and right responses', () => {
    const availableQuestionsIds = getAvailableQuestionsIds(allTypeQuestions, allTypeResponses);
    const errors = validateResponses(
      allRequiredQuestions,
      allTypeResponses,
      'reply',
      intlMock,
      false,
      availableQuestionsIds,
    );
    expect(errors).toEqual(noErrorResponses);
  });

  it('should work correctly with all questions not required and right responses', () => {
    const availableQuestionsIds = getAvailableQuestionsIds(
      allNotRequiredQuestions,
      allTypeResponses,
    );
    const errors = validateResponses(
      allNotRequiredQuestions,
      allTypeResponses,
      'reply',
      intlMock,
      false,
      availableQuestionsIds,
    );
    expect(errors).toEqual(noErrorResponses);
  });

  it('should work correctly with many question text empty', () => {
    allTypeResponses[1].value = null;
    allTypeResponses[2].value = null;
    allTypeResponses[3].value = null;

    const availableQuestionsIds = getAvailableQuestionsIds(allTypeQuestions, allTypeResponses);
    const errors = validateResponses(
      allRequiredQuestions,
      allTypeResponses,
      'reply',
      intlMock,
      false,
      availableQuestionsIds,
    );
    expect(errors).toEqual(errorResponses);
  });

  it('should render all type error', () => {
    const availableQuestionsIds = getAvailableQuestionsIds(
      allTypeQuestionsWithRule,
      allTypeResponsesWithError,
    );
    const errors = validateResponses(
      allTypeQuestionsWithRule,
      allTypeResponsesWithError,
      'reply',
      intlMock,
      false,
      availableQuestionsIds,
    );
    expect(errors).toEqual(allTypeErrorResponses);
  });
});
