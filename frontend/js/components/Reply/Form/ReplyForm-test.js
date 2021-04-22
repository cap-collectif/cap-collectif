// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import { intlMock, formMock, $refType } from '~/mocks';
import { ReplyForm } from './ReplyForm';

describe('<ReplyForm />', () => {
  const questionnaireProps = {
    multipleRepliesAllowed: true,
    anonymousAllowed: true,
    description: null,
    $refType,
    id: '2',
    phoneConfirmationRequired: false,
    contribuable: true,
    type: 'QUESTIONNAIRE',
  };

  const requiredText = {
    id: '10',
    type: 'text',
    __typename: 'SimpleQuestion',
    title:
      "Êtes-vous satisfait que la ville de Paris soit candidate à l'organisation des JO de 2024 ?",
    helpText: '',
    number: 2,
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 1,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: true,
    hidden: false,
    isOtherAllowed: false,
    choices: {
      pageInfo: {
        hasNextPage: false,
      },
      totalCount: 0,
      edges: [],
    },
  };

  const facultativeCheckbox = {
    id: '11',
    type: 'checkbox',
    __typename: 'MultipleChoiceQuestion',
    title: "Pour quel type d'épreuve êtes vous prêt à acheter des places",
    number: 3,
    helpText: 'Plusieurs choix sont possibles',
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 2,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: true,
    hidden: false,
    choices: {
      pageInfo: {
        hasNextPage: false,
      },
      totalCount: 4,
      edges: [
        {
          node: {
            id: '20',
            title: 'Athlétisme',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '21',
            title: 'Natation',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '22',
            title: 'Sports collectifs',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '23',
            title: 'Sports individuels',
            color: null,
            image: null,
            description: 'description',
          },
        },
      ],
    },
  };

  const requiredRadio = {
    id: '12',
    type: 'radio',
    __typename: 'MultipleChoiceQuestion',
    title: 'Quel est ton athlète favori ?',
    number: 4,
    helpText: 'Un seul choix possible',
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 3,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: true,
    isOtherAllowed: true,
    hidden: false,
    choices: {
      pageInfo: {
        hasNextPage: false,
      },
      totalCount: 4,
      edges: [
        {
          node: {
            id: '24',
            title: 'Maxime Arrouard',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '25',
            title: 'Spylou Super Sayen',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '26',
            title: 'Cyril Lage',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '27',
            title: 'Superman',
            color: null,
            image: null,
            description: 'description',
          },
        },
      ],
    },
  };

  const facultativeSelect = {
    id: '13',
    type: 'select',
    __typename: 'MultipleChoiceQuestion',
    title: 'Nelson Monfort parle-t-il:',
    number: 5,
    helpText: 'Merci de répondre sincèrement',
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 4,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: false,
    hidden: false,
    choices: {
      pageInfo: {
        hasNextPage: false,
      },
      totalCount: 3,
      edges: [
        {
          node: {
            id: '28',
            title: 'Pas assez fort (Mon sonotone est en panne)',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '29',
            title: 'Assez fort (Mon sonotone est mal réglé)',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '30',
            title: 'Trop fort (Mon sonotone est tout neuf)',
            color: null,
            image: null,
            description: 'description',
          },
        },
      ],
    },
  };

  const facultativeRanking = {
    id: '14',
    type: 'ranking',
    __typename: 'MultipleChoiceQuestion',
    title: 'Nelson Monfort parle-t-il:',
    number: 6,
    helpText: 'Merci de répondre sincèrement',
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 5,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: false,
    hidden: false,
    choices: {
      pageInfo: {
        hasNextPage: false,
      },
      totalCount: 3,
      edges: [
        {
          node: {
            id: '28',
            title: 'Pas assez fort (Mon sonotone est en panne)',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '29',
            title: 'Assez fort (Mon sonotone est mal réglé)',
            color: null,
            image: null,
            description: 'description',
          },
        },
        {
          node: {
            id: '30',
            title: 'Trop fort (Mon sonotone est tout neuf)',
            color: null,
            image: null,
            description: 'description',
          },
        },
      ],
    },
  };

  const facultativeSelectWithLotOfChoices = {
    id: '15',
    type: 'select',
    __typename: 'MultipleChoiceQuestion',
    title: 'Ton choix préféré ?',
    number: 5,
    helpText: "Je suis censé t'aider",
    jumps: [],
    destinationJumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 6,
    validationRule: null,
    description: null,
    private: false,
    required: false,
    isOtherAllowed: false,
    hidden: false,
    choices: {
      pageInfo: {
        hasNextPage: true,
      },
      totalCount: 30,
      edges: [...Array(30)].map((_, i) => ({
        node: {
          id: String(i + 31),
          title: `Je suis le choix ${i + 31}`,
          color: null,
          image: null,
          description: `Je suis la description du choix ${i + 31}`,
        },
      })),
    },
  };

  const props = {
    intl: intlMock,
    ...formMock,
    responses: [
      { question: 'Nelson Monfort parle-t-il:', value: 'Trop fort (Mon sonotone est tout neuf)' },
      {
        question: "Pour quel type d'épreuve êtes vous prêt à acheter des places",
        value: { labels: ['Superman'], other: 'Pikachu' },
      },
    ],
    history: createMemoryHistory(),
    user: null,
  };

  it('should render correctly with equal required and facultative fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [requiredText, requiredRadio, facultativeSelect, facultativeRanking],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with minority of required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [
            requiredText,
            facultativeCheckbox,
            requiredRadio,
            facultativeSelect,
            facultativeRanking,
          ],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with majority of required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [requiredText, requiredRadio, facultativeRanking],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with only required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [requiredText, requiredRadio],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with only facultatives fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [facultativeCheckbox, facultativeSelect, facultativeRanking],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a select with a lot of choices', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
          step: { id: 'step1', title: 'Step 1' },
          questions: [facultativeCheckbox, facultativeSelectWithLotOfChoices, facultativeRanking],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
