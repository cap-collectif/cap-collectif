// @flow
/* eslint-env jest */
import { getAvailableQuestionsIds, renderResponses, validateResponses } from './responsesHelper';
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

describe('getAvailableQuestionsIds', () => {
  it('Should return the correct questions ids for a simple questionnaire without logic jumps', () => {
    const questions = [
      {
        id: 'question1',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        title: 'Est ce que ce test marche ?',
        private: false,
        helpText: null,
        choices: [
          {
            id: 'oui',
            color: null,
            description: null,
            image: null,
            title: 'Oui',
          },
          {
            id: 'non',
            color: null,
            description: null,
            image: null,
            title: 'Non',
          },
        ],
        jumps: [],
        number: 1,
        position: 1,
        required: false,
      },
      {
        id: 'question2',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        title: 'Quelle est ta waifu préférée ?',
        private: false,
        helpText: null,
        choices: [
          {
            id: 'rem',
            color: null,
            description: null,
            image: null,
            title: 'Rem',
          },
          {
            id: 'emilia',
            color: null,
            description: null,
            image: null,
            title: 'Emilia',
          },
        ],
        jumps: [],
        number: 2,
        position: 2,
        required: false,
      },
    ];
    const responses = [
      {
        question: 'question1',
        value: 'Oui',
      },
      {
        question: 'question2',
        value: 'Rem',
      },
    ];
    const ids = getAvailableQuestionsIds(questions, responses);
    expect(ids).toMatchSnapshot();
  });

  it('Should return the correct questions ids for a simple questionnaire with logic jumps', () => {
    const questions = [
      {
        id: 'question1',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        title: 'Est ce que ce test marche ?',
        private: false,
        helpText: null,
        choices: [
          {
            id: 'oui',
            color: null,
            description: null,
            image: null,
            title: 'Oui',
          },
          {
            id: 'non',
            color: null,
            description: null,
            image: null,
            title: 'Non',
          },
        ],
        jumps: [],
        number: 1,
        position: 1,
        required: false,
      },
      {
        id: 'question2',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        private: false,
        helpText: null,
        title: 'Quelle est ta waifu préférée ?',
        choices: [
          {
            id: 'rem',
            color: null,
            description: null,
            image: null,
            title: 'Rem',
          },
          {
            id: 'emilia',
            color: null,
            description: null,
            image: null,
            title: 'Emilia',
          },
        ],
        jumps: [
          {
            id: 'jump1',
            always: false,
            conditions: [
              {
                id: 'conditionQuestion2-1',
                operator: 'IS',
                question: {
                  id: 'question2',
                  title: 'Quelle est ta waifu préférée ?',
                },
                value: {
                  id: 'emilia',
                  title: 'Emilia',
                },
              },
            ],
            origin: {
              id: 'question2',
            },
            destination: {
              id: 'question2-1',
              number: 3,
              title: "C'est son côté Satela que tu aimes bien ?",
            },
          },
          {
            id: 'jump2',
            always: false,
            conditions: [
              {
                id: 'conditionQuestion2-2',
                operator: 'IS',
                question: {
                  id: 'question2',
                  title: 'Quelle est ta waifu préférée ?',
                },
                value: {
                  id: 'rem',
                  title: 'Rem',
                },
              },
            ],
            origin: {
              id: 'question2',
            },
            destination: {
              id: 'question2-2',
              number: 4,
              title: "C'est son côté maid que tu aimes bien ?",
            },
          },
        ],
        number: 2,
        position: 2,
        required: false,
      },
      {
        id: 'question2-1',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        private: false,
        helpText: null,
        title: "C'est son côté Satela que tu aimes bien ?",
        choices: [
          {
            id: 'of-course',
            color: null,
            description: null,
            image: null,
            title: 'Bien sûr',
          },
          {
            id: 'never',
            color: null,
            description: null,
            image: null,
            title: "Jamais, c'est pour sa pureté",
          },
        ],
        jumps: [],
        number: 3,
        position: 3,
        required: false,
      },
      {
        id: 'question2-2',
        randomQuestionChoices: false,
        type: 'select',
        description: null,
        validationRule: null,
        isOtherAllowed: false,
        private: false,
        helpText: null,
        title: "C'est son côté maid que tu aimes bien ?",
        choices: [
          {
            id: 'indeed',
            color: null,
            description: null,
            image: null,
            title: 'Effectivement',
          },
          {
            id: 'strenght',
            color: null,
            description: null,
            image: null,
            title: "Non, c'est pour sa force",
          },
        ],
        jumps: [],
        number: 4,
        position: 4,
        required: false,
      },
    ];
    const responses = [
      {
        question: 'question1',
        value: 'Oui',
      },
      {
        question: 'question2',
        value: 'Rem',
      },
      {
        question: 'question2-1',
        value: null,
      },
      {
        question: 'question2-2',
        value: "Non, c'est pour sa force",
      },
    ];
    const ids = getAvailableQuestionsIds(questions, responses);
    expect(ids).toMatchSnapshot();
  });
});
