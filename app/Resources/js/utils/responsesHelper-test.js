// @flow
/* eslint-env jest */
import {
  getAvailableQuestionsIds,
  getNextLogicJumpQuestion,
  getQuestionDeps,
  renderResponses,
  validateResponses,
} from './responsesHelper';
import { intlMock } from '../mocks';

const questionnaireQuestions = [
  {
    id: 'UXVlc3Rpb246MjQ=',
    title: 'Hap ou Noel ?',
    number: 1,
    private: false,
    position: 1,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceHap',
        title: 'Hap',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceNoel',
        title: 'Noel',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246NDU=',
    title: 'Votre fleuve préféré',
    number: 2,
    private: false,
    position: 2,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: null,
    jumps: [
      {
        id: 'logicjump1',
        origin: {
          id: 'UXVlc3Rpb246NDU=',
        },
        destination: {
          id: 'UXVlc3Rpb246NDY=',
          title:
            "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
          number: 3,
        },
        conditions: [
          {
            id: 'ljconditionFleuveGange',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246NDU=',
              title: 'Votre fleuve préféré',
            },
            value: {
              id: 'questionchoicLeGange',
              title: 'Le gange',
            },
          },
          {
            id: 'ljconditionFleuveHapLg1',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MjQ=',
              title: 'Hap ou Noel ?',
            },
            value: {
              id: 'questionchoiceHap',
              title: 'Hap',
            },
          },
        ],
      },
      {
        id: 'logicjump2',
        origin: {
          id: 'UXVlc3Rpb246NDU=',
        },
        destination: {
          id: 'UXVlc3Rpb246MjU=',
          title: 'Par qui Hap a t-il été créé ?',
          number: 4,
        },
        conditions: [
          {
            id: 'ljconditionFleuveHap',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MjQ=',
              title: 'Hap ou Noel ?',
            },
            value: {
              id: 'questionchoiceHap',
              title: 'Hap',
            },
          },
        ],
      },
      {
        id: 'logicjump3',
        origin: {
          id: 'UXVlc3Rpb246NDU=',
        },
        destination: {
          id: 'UXVlc3Rpb246Mjc=',
          title: 'Noel a t-il un rapport avec la fête de Noël ?',
          number: 7,
        },
        conditions: [
          {
            id: 'ljconditionNoel',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MjQ=',
              title: 'Hap ou Noel ?',
            },
            value: {
              id: 'questionchoiceNoel',
              title: 'Noel',
            },
          },
        ],
      },
    ],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoicLeGange',
        title: 'Le gange',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceLeNil',
        title: 'Le nil',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceLaSeine',
        title: 'La seine',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceAmazone',
        title: "L'Amazone",
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246NDY=',
    title: "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
    number: 3,
    private: false,
    position: 3,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246MjU=',
      title: 'Par qui Hap a t-il été créé ?',
      number: 4,
    },
    jumps: [],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceHapGangeOui',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceHapGangeNon',
        title: 'Non',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MjU=',
    title: 'Par qui Hap a t-il été créé ?',
    number: 4,
    private: false,
    position: 4,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceJvc',
        title: 'JVC',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceTesla',
        title: 'Tesla',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceCisla',
        title: 'Cisla',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MjY=',
    title: 'Hap est-il un homme bon ?',
    number: 5,
    private: false,
    position: 5,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246MzE=',
      title: 'Plutôt Marvel ou DC ?',
      number: 9,
    },
    jumps: [
      {
        id: 'logicjump10',
        origin: {
          id: 'UXVlc3Rpb246MjY=',
        },
        destination: {
          id: 'UXVlc3Rpb246Mzk=',
          title: "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
          number: 6,
        },
        conditions: [
          {
            id: 'ljconditionHapGood',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MjY=',
              title: 'Hap est-il un homme bon ?',
            },
            value: {
              id: 'questionchoiceHapBonNon',
              title: 'Non',
            },
          },
        ],
      },
    ],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceHapBonOui',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceHapBonNon',
        title: 'Non',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246Mzk=',
    title: "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
    number: 6,
    private: false,
    position: 6,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246MzE=',
      title: 'Plutôt Marvel ou DC ?',
      number: 9,
    },
    jumps: [],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceHapNotGoodHowDareYouOk',
        title: 'Oki',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceHapNotGoodHowDareYouGp',
        title: 'mdr g pas lu',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246Mjc=',
    title: 'Noel a t-il un rapport avec la fête de Noël ?',
    number: 7,
    private: false,
    position: 7,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceNoelOui',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceNoelNonBaka',
        title: 'Non baka',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246Mjg=',
    title: 'De quelle couleur est le chapeau de Noël ?',
    number: 8,
    private: false,
    position: 8,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246MzE=',
      title: 'Plutôt Marvel ou DC ?',
      number: 9,
    },
    jumps: [],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceNoelRedHat',
        title: 'Rouge',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceNoelGreenHat',
        title: 'Vert',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceNoelBlueHat',
        title: 'Bleu',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzE=',
    title: 'Plutôt Marvel ou DC ?',
    number: 9,
    private: false,
    position: 9,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: null,
    jumps: [
      {
        id: 'logicjump4',
        origin: {
          id: 'UXVlc3Rpb246MzE=',
        },
        destination: {
          id: 'UXVlc3Rpb246MzU=',
          title: "T'aimes bien Iron Man ?",
          number: 13,
        },
        conditions: [
          {
            id: 'ljconditionMarvel',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MzE=',
              title: 'Plutôt Marvel ou DC ?',
            },
            value: {
              id: 'questionchoiceMarvelOrDcMarvel',
              title: 'Marvel',
            },
          },
        ],
      },
      {
        id: 'logicjump5',
        origin: {
          id: 'UXVlc3Rpb246MzE=',
        },
        destination: {
          id: 'UXVlc3Rpb246MzI=',
          title: "T'aimes bien Superman ?",
          number: 10,
        },
        conditions: [
          {
            id: 'ljconditionDc',
            operator: 'IS',
            question: {
              id: 'UXVlc3Rpb246MzE=',
              title: 'Plutôt Marvel ou DC ?',
            },
            value: {
              id: 'questionchoiceMarvelOrDcDc',
              title: 'DC',
            },
          },
        ],
      },
    ],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceMarvelOrDcMarvel',
        title: 'Marvel',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceMarvelOrDcDc',
        title: 'DC',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzI=',
    title: "T'aimes bien Superman ?",
    number: 10,
    private: false,
    position: 10,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceDcSupermanYes',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceDcSupermanNo',
        title: 'Non',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzM=',
    title: "T'aimes bien Batman ?",
    number: 11,
    private: false,
    position: 11,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceDcBatmanYes',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceDcBatmanYes2',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzQ=',
    title: "T'aimes bien Supergirl ?",
    number: 12,
    private: false,
    position: 12,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246Mzg=',
      title: "C'est la fin mais j'affiche quand même des choix",
      number: 16,
    },
    jumps: [],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceDcSupergirlYes',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceDcSupergirlNo',
        title: 'Non',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzU=',
    title: "T'aimes bien Iron Man ?",
    number: 13,
    private: false,
    position: 13,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceMarvelIronManYes',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceMarvelIronManNo',
        title: 'Non',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246MzY=',
    title: "T'aimes bien Luke Cage ?",
    number: 14,
    private: false,
    position: 14,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceMarvelLukeCageYes',
        title: 'Oui c un bo chauve ténébreux',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceMarvelLukeCageYes2',
        title: 'Oui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceMarvelLukeCageYes3',
        title: 'OUI',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246Mzc=',
    title: "T'aimes bien Thor ?",
    number: 15,
    private: false,
    position: 15,
    required: false,
    helpText: null,
    alwaysJumpDestinationQuestion: {
      id: 'UXVlc3Rpb246Mzg=',
      title: "C'est la fin mais j'affiche quand même des choix",
      number: 16,
    },
    jumps: [],
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceMarvelThorYes',
        title: 'ui',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceMarvelThorNo',
        title: 'nn',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
  {
    id: 'UXVlc3Rpb246Mzg=',
    title: "C'est la fin mais j'affiche quand même des choix",
    number: 16,
    private: false,
    position: 16,
    required: false,
    helpText: null,
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    description: null,
    type: 'select',
    isOtherAllowed: false,
    randomQuestionChoices: false,
    validationRule: null,
    __typename: 'MultipleChoiceQuestion',
    choices: [
      {
        id: 'questionchoiceEndConditionOk',
        title: 'Oki',
        description: null,
        color: null,
        image: null,
      },
      {
        id: 'questionchoiceEndConditionOk2',
        title: 'Doki',
        description: null,
        color: null,
        image: null,
      },
    ],
  },
];

const numberQuestion = {
  id: 'numberQuestion',
  title: 'Un nombre stp',
  number: 1,
  private: false,
  required: true,
  description: null,
  helpText: null,
  type: 'number',
  __typename: 'SimpleQuestion',
  jumps: [],
  alwaysJumpDestinationQuestion: null,
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
  __typename: 'MultipleChoiceQuestion',
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
  alwaysJumpDestinationQuestion: null,
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
  __typename: 'MediaQuestion',
  jumps: [],
  alwaysJumpDestinationQuestion: null,
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
  __typename: 'SimpleQuestion',
  jumps: [],
  alwaysJumpDestinationQuestion: null,
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

  it('Should return object errors please-enter-a-number when draft is true', () => {
    const questions = [numberQuestion];
    const responses = [{ ...numberReponse, value: 'notanumber' }];
    const value = validateResponses(questions, responses, className, intlMock, true);
    expect(value).toEqual({ responses: [{ value: 'please-enter-a-number' }] });
  });

  it('Should return object errors field_mandatory', () => {
    const questions = [{ ...textQuestion, required: true }];
    const responses = [{ ...textReponse, value: null }];
    const value = validateResponses(questions, responses, className, intlMock);
    expect(value).toEqual({ responses: [{ value: 'test.constraints.field_mandatory' }] });
  });

  it('Should not return object errors when draft is true', () => {
    const questions = [{ ...textQuestion, required: true }];
    const responses = [{ ...textReponse, value: null }];
    const value = validateResponses(questions, responses, className, intlMock, true);
    expect(value).toEqual({ responses: [undefined] });
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
        jumps: [
          {
            id: 'jump1',
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
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
        __typename: 'MultipleChoiceQuestion',
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
        alwaysJumpDestinationQuestion: null,
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

describe('getNextLogicJumpQuestion', () => {
  it('Should return the correct next logic jump question', () => {
    const questions = [...questionnaireQuestions];
    let sample = questions[0];
    const fleuveQuestion = getNextLogicJumpQuestion(sample, questions);
    expect(fleuveQuestion).toMatchSnapshot();

    sample = questions[3];
    const hapGoodQuestion = getNextLogicJumpQuestion(sample, questions);
    expect(hapGoodQuestion).toMatchSnapshot();
  });
});

describe('getQuestionDeps', () => {
  it('Should return a correct list of dependent questions for a given question', () => {
    const questions = [...questionnaireQuestions];
    let question = questions[2]; // Comme tu as choisi Hap et le Gange question
    let deps = getQuestionDeps(question, questions);
    expect(deps).toMatchSnapshot();

    question = questions[questions.length - 1]; // C'est la fin mais j'affiche quand même des choix question
    deps = getQuestionDeps(question, questions);
    expect(deps).toMatchSnapshot();
  });
});
