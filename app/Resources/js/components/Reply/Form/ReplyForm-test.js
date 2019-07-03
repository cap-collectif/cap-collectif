// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '../../../mocks';
import { ReplyForm } from './ReplyForm';

describe('<ReplyForm />', () => {
  const questionnaireProps = {
    multipleRepliesAllowed: true,
    anonymousAllowed: true,
    description: null,
    $refType,
    title: '',
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
    alwaysJumpDestinationQuestion: null,
    position: 1,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: true,
    isOtherAllowed: false,
    choices: [],
  };

  const facultativeCheckbox = {
    id: '11',
    type: 'checkbox',
    __typename: 'MultipleChoiceQuestion',
    title: "Pour quel type d'épreuve êtes vous prêt à acheter des places",
    number: 3,
    helpText: 'Plusieurs choix sont possibles',
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 2,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: true,
    choices: [
      { id: '20', title: 'Athlétisme', color: null, image: null, description: 'description' },
      { id: '21', title: 'Natation', color: null, image: null, description: 'description' },
      {
        id: '22',
        title: 'Sports collectifs',
        color: null,
        image: null,
        description: 'description',
      },
      {
        id: '23',
        title: 'Sports individuels',
        color: null,
        image: null,
        description: 'description',
      },
    ],
  };

  const requiredRadio = {
    id: '12',
    type: 'radio',
    __typename: 'MultipleChoiceQuestion',
    title: 'Quel est ton athlète favori ?',
    number: 4,
    helpText: 'Un seul choix possible',
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 3,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: true,
    isOtherAllowed: true,
    choices: [
      { id: '24', title: 'Maxime Arrouard', color: null, image: null, description: 'description' },
      {
        id: '25',
        title: 'Spylou Super Sayen',
        color: null,
        image: null,
        description: 'description',
      },
      { id: '26', title: 'Cyril Lage', color: null, image: null, description: 'description' },
      { id: '27', title: 'Superman', color: null, image: null, description: 'description' },
    ],
  };

  const facultativeSelect = {
    id: '13',
    type: 'select',
    __typename: 'MultipleChoiceQuestion',
    title: 'Nelson Monfort parle-t-il:',
    number: 5,
    helpText: 'Merci de répondre sincèrement',
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 4,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: false,
    choices: [
      {
        id: '28',
        title: 'Pas assez fort (Mon sonotone est en panne)',
        color: null,
        image: null,
        description: 'description',
      },
      {
        id: '29',
        title: 'Assez fort (Mon sonotone est mal réglé)',
        color: null,
        image: null,
        description: 'description',
      },
      {
        id: '30',
        title: 'Trop fort (Mon sonotone est tout neuf)',
        color: null,
        image: null,
        description: 'description',
      },
    ],
  };

  const facultativeRanking = {
    id: '14',
    type: 'ranking',
    __typename: 'MultipleChoiceQuestion',
    title: 'Nelson Monfort parle-t-il:',
    number: 6,
    helpText: 'Merci de répondre sincèrement',
    jumps: [],
    alwaysJumpDestinationQuestion: null,
    position: 5,
    validationRule: null,
    description: 'description of question',
    private: false,
    required: false,
    isOtherAllowed: false,
    choices: [
      {
        id: '28',
        title: 'Pas assez fort (Mon sonotone est en panne)',
        color: null,
        image: null,
        description: 'description',
      },
      {
        id: '29',
        title: 'Assez fort (Mon sonotone est mal réglé)',
        color: null,
        image: null,
        description: 'description',
      },
      {
        id: '30',
        title: 'Trop fort (Mon sonotone est tout neuf)',
        color: null,
        image: null,
        description: 'description',
      },
    ],
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
    user: null,
  };

  it('should render correctly with equal required and facultative fields', () => {
    const wrapper = shallow(
      <ReplyForm
        questionnaire={{
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
        questionnaire={{ questions: [requiredText, requiredRadio], ...questionnaireProps }}
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
          questions: [facultativeCheckbox, facultativeSelect, facultativeRanking],
          ...questionnaireProps,
        }}
        reply={null}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
