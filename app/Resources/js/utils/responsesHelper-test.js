// @flow
/* eslint-env jest */
import { validateResponses } from './responsesHelper';

const numberQuestion = {
  id: '2',
  title: 'Un nombre stp',
  number: 1,
  private: false,
  required: true,
  description: null,
  helpText: null,
  type: 'number',
  jumps: [],
  position: 1,
};

const textQuestion = {
  id: '1',
  title: 'ça roule ?',
  number: 2,
  private: false,
  required: false,
  description: null,
  helpText: null,
  type: 'textarea',
  jumps: [],
  position: 2,
};

const textReponse = {
  question: '1',
  value: 'a',
};

const numberReponse = {
  question: '2',
  value: '12',
};

const className = 'test';

const intl: any = () => {};

describe('validateResponses', () => {
  it('Should return no errors with correct responsesNumber', () => {
    const questions = [textQuestion, numberQuestion];
    const responses = [textReponse, numberReponse];
    const value = validateResponses(questions, responses, className, intl);
    expect(value).toEqual({ responses: [undefined, undefined] });
  });

  it('Should return no errors with a correct negative float number', () => {
    const questions = [numberQuestion];
    const responses = [{ ...numberReponse, value: '-4242,1212' }];
    const value = validateResponses(questions, responses, className, intl);
    expect(value).toEqual({ responses: [undefined] });
  });

  it('Should return object errors please-enter-a-number', () => {
    const questions = [numberQuestion];
    const responses = [{ ...numberReponse, value: 'notanumber' }];
    const value = validateResponses(questions, responses, className, intl);
    expect(value).toEqual({ responses: [{ value: 'please-enter-a-number' }] });
  });

  it('Should return object errors field_mandatory', () => {
    const questions = [{ ...textQuestion, required: true }];
    const responses = [{ ...textReponse, value: null }];
    const value = validateResponses(questions, responses, className, intl);
    expect(value).toEqual({ responses: [{ value: 'test.constraints.field_mandatory' }] });
  });
});
