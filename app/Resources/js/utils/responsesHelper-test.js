// @flow
/* eslint-env jest */
import { validateResponses, renderResponses } from './responsesHelper';
import { intlMock } from '../mocks';

const numberQuestion = {
  id: 'numberQuestion',
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

const selectQuestion = {
  id: 'selectQuestion',
  title: 'Un héro stp (secret)',
  number: 3,
  private: true,
  required: true,
  description: null,
  helpText: null,
  type: 'select',
  choices: [
    {
      id: 'choice1',
      title: 'Choice 1',
      description: null,
      color: null,
      image: null,
    },
    {
      id: 'choice2',
      title: 'Choice 2',
      description: null,
      color: null,
      image: null,
    },
  ],
  validationRule: null,
  jumps: [],
  position: 2,
};

const mediaQuestion = {
  id: 'mediaQuestion',
  title: "Envoyez-nous l'estimation financière de votre projet",
  number: 4,
  position: 3,
  private: false,
  required: true,
  description: null,
  helpText: null,
  type: 'medias',
  jumps: [],
};

const textQuestion = {
  id: 'textQuestion',
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
  question: 'textQuestion',
  value: 'a',
};

const numberReponse = {
  question: 'numberQuestion',
  value: '12',
};

const className = 'test';

describe('validateResponses', () => {
  it('Should return no errors with correct responsesNumber', () => {
    const questions = [textQuestion, numberQuestion];
    const responses = [textReponse, numberReponse];
    const value = validateResponses(questions, responses, className, intlMock);
    expect(value).toEqual({ responses: [undefined, undefined] });
  });

  it('Should return no errors with a correct negative float number', () => {
    const questions = [numberQuestion];
    const responses = [{ ...numberReponse, value: '-4242,1212' }];
    const value = validateResponses(questions, responses, className, intlMock);
    expect(value).toEqual({ responses: [undefined] });
  });

  it('Should return object errors please-enter-a-number', () => {
    const questions = [numberQuestion];
    const responses = [{ ...numberReponse, value: 'notanumber' }];
    const value = validateResponses(questions, responses, className, intlMock);
    expect(value).toEqual({ responses: [{ value: 'please-enter-a-number' }] });
  });

  it('Should return object errors field_mandatory', () => {
    const questions = [{ ...textQuestion, required: true }];
    const responses = [{ ...textReponse, value: null }];
    const value = validateResponses(questions, responses, className, intlMock);
    expect(value).toEqual({ responses: [{ value: 'test.constraints.field_mandatory' }] });
  });

  it('Should render correctly when empty', () => {
    const component = renderResponses({
      questions: [textQuestion, numberQuestion, selectQuestion, mediaQuestion],
      responses: [],
      intl: intlMock,
      disabled: false,
      change: jest.fn(),
      form: 'toto-form',
      meta: {
        dirty: false,
        form: 'toto-form',
        invalid: false,
        pristine: false,
        submitFailed: false,
        submitting: false,
        touched: false,
        valid: true,
      },
      fields: [textQuestion, numberQuestion, selectQuestion, mediaQuestion],
    });
    expect(component).toMatchSnapshot();
  });
});
