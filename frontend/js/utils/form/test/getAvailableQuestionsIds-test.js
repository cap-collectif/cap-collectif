// @flow
import getAvailableQuestionsIds from '~/utils/form/getAvailableQuestionsIds';
import {
  simple,
  onlyAlwaysJump,
  manyAlwaysJump,
  onlyJump,
  jumpThenAlwaysJump,
  manySimpleAndManyJump,
  manyJumpAndOneAlwaysJump,
} from '~/utils/form/test/mocks';

// Q = Question

const ALL_CASE_QUESTIONNAIRE = {
  simple: {
    form: simple,
    result: ['UXVlc3Rpb246NDg1', 'UXVlc3Rpb246NDg0'],
  },
  onlyAlwaysJump: {
    form: onlyAlwaysJump,
    result: ['UXVlc3Rpb246NDg1', 'UXVlc3Rpb246NDg0'],
  },
  manyAlwaysJump: {
    form: manyAlwaysJump,
    result: [
      'UXVlc3Rpb246NDg3',
      'UXVlc3Rpb246NDky',
      'UXVlc3Rpb246NDkx',
      'UXVlc3Rpb246NDk2',
      'UXVlc3Rpb246NDk1',
    ],
  },
  onlyJump: {
    form: onlyJump,
    responses: [
      {
        question: 'UXVlc3Rpb246NDg3',
        value: { value: 'Jump to question 3', label: 'Jump to question 3' },
      },
    ],
    result: ['UXVlc3Rpb246NDg3', 'UXVlc3Rpb246NDg4'],
  },
  jumpThenAlwaysJump: {
    form: jumpThenAlwaysJump,
    responses: [
      {
        question: 'UXVlc3Rpb246NDg3',
        value: { value: 'Jump to question 3', label: 'Jump to question 3' },
      },
    ],
    result: ['UXVlc3Rpb246NDg3', 'UXVlc3Rpb246NDg4', 'UXVlc3Rpb246NDkw'],
  },
  getSimpleWithManySimpleAndManyJump: {
    form: manySimpleAndManyJump,
    result: ['UXVlc3Rpb246NDg3', 'UXVlc3Rpb246NDky', 'UXVlc3Rpb246NDkz', 'UXVlc3Rpb246NDk0'],
  },
  getAllWithManySimpleAndManyJump: {
    form: manySimpleAndManyJump,
    responses: [
      {
        question: 'UXVlc3Rpb246NDg3',
        value: { value: 'Jump to question 2', label: 'Jump to question 2' },
      },
      {
        question: 'UXVlc3Rpb246NDkz',
        value: { value: 'Afficher question 5', label: 'Afficher question 5' },
      },
    ],
    result: [
      'UXVlc3Rpb246NDg3',
      'UXVlc3Rpb246NDg4',
      'UXVlc3Rpb246NDky',
      'UXVlc3Rpb246NDkz',
      'UXVlc3Rpb246NDkx',
      'UXVlc3Rpb246NDk0',
    ],
  },
  manyJumpAndOneAlwaysJump: {
    form: manyJumpAndOneAlwaysJump,
    responses: [],
    result: ['UXVlc3Rpb246Mjg='],
  },
};

describe('getAvailableQuestionsIds', () => {
  it('SIMPLE CASE - should render correctly', () => {
    const ids = getAvailableQuestionsIds(ALL_CASE_QUESTIONNAIRE.simple.form, []);
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.simple.result);
  });

  it('ONLY ALWAYS JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(ALL_CASE_QUESTIONNAIRE.onlyAlwaysJump.form, []);
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.onlyAlwaysJump.result);
  });

  it('MANY ALWAYS JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(ALL_CASE_QUESTIONNAIRE.manyAlwaysJump.form, []);
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.manyAlwaysJump.result);
  });

  it('ONLY JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(
      ALL_CASE_QUESTIONNAIRE.onlyJump.form,
      ALL_CASE_QUESTIONNAIRE.onlyJump.responses,
    );
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.onlyJump.result);
  });

  it('MANY JUMP AND ONE ALWAYS JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(ALL_CASE_QUESTIONNAIRE.manyJumpAndOneAlwaysJump.form, []);
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.manyJumpAndOneAlwaysJump.result);
  });

  it('JUMP THEN ALWAYS JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(
      ALL_CASE_QUESTIONNAIRE.jumpThenAlwaysJump.form,
      ALL_CASE_QUESTIONNAIRE.jumpThenAlwaysJump.responses,
    );
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.jumpThenAlwaysJump.result);
  });

  it('GET ALL SIMPLE Q EVEN BETWEEN Q JUMP - should render correctly', () => {
    const ids = getAvailableQuestionsIds(
      ALL_CASE_QUESTIONNAIRE.getSimpleWithManySimpleAndManyJump.form,
      [],
    );
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.getSimpleWithManySimpleAndManyJump.result);
  });

  it('GET ALL Q DISPLAY WITH JUMP COMPLETE - should render correctly', () => {
    const ids = getAvailableQuestionsIds(
      ALL_CASE_QUESTIONNAIRE.getAllWithManySimpleAndManyJump.form,
      ALL_CASE_QUESTIONNAIRE.getAllWithManySimpleAndManyJump.responses,
    );
    expect(ids).toEqual(ALL_CASE_QUESTIONNAIRE.getAllWithManySimpleAndManyJump.result);
  });
});
