/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import ReplyForm from './ReplyForm';

describe('<ReplyForm />', () => {
  const requiredText = {
    id: 10,
    type: 'text',
    slug: 'etes-vous-satisfait-que-la-ville-de-paris-soit-candidate-a-l-organisation-des-jo-de-2024',
    question: 'Êtes-vous satisfait que la ville de Paris soit candidate à l\'organisation des JO de 2024 ?',
    helpText: '',
    required: true,
  };

  const facultativeCheckbox = {
    id: 11,
    type: 'checkbox',
    slug: 'pour-quel-type-d-epreuve-etes-vous-pret-a-acheter-des-places',
    question: 'Pour quel type d\'épreuve êtes vous prêt à acheter des places',
    helpText: 'Plusieurs choix sont possibles',
    required: false,
    isOtherAllowed: true,
    choices: [
      { id: 20, label: 'Athlétisme' },
      { id: 21, label: 'Natation' },
      { id: 22, label: 'Sports collectifs' },
      { id: 23, label: 'Sports individuels' },
    ],
  };

  const requiredRadio = {
    id: 12,
    type: 'radio',
    slug: 'quel-est-ton-athlete-favori',
    question: 'Quel est ton athlète favori ?',
    helpText: 'Un seul choix possible',
    required: true,
    isOtherAllowed: true,
    choices: [
      { id: 24, label: 'Maxime Arrouard' },
      { id: 25, label: 'Spylou Super Sayen' },
      { id: 26, label: 'Cyril Lage' },
      { id: 27, label: 'Superman' },
    ],
  };

  const facultativeSelect = {
    id: 13,
    type: 'select',
    slug: 'nelson-monfort-parle-t-il',
    question: 'Nelson Monfort parle-t-il:',
    helpText: 'Merci de répondre sincèrement',
    required: false,
    choices: [
      { id: 28, label: 'Pas assez fort (Mon sonotone est en panne)' },
      { id: 29, label: 'Assez fort (Mon sonotone est mal réglé)' },
      { id: 30, label: 'Trop fort (Mon sonotone est tout neuf)' },
    ],
  };

  const facultativeRanking = {
    id: 14,
    type: 'ranking',
    slug: 'nelson-monfort-parle-t-il',
    question: 'Nelson Monfort parle-t-il:',
    helpText: 'Merci de répondre sincèrement',
    required: false,
    choices: [
      { id: 28, label: 'Pas assez fort (Mon sonotone est en panne)' },
      { id: 29, label: 'Assez fort (Mon sonotone est mal réglé)' },
      { id: 30, label: 'Trop fort (Mon sonotone est tout neuf)' },
    ],
  };

  const props = {
    isSubmitting: false,
    onSubmitSuccess: jest.fn(),
    onSubmitFailure: jest.fn(),
    onValidationFailure: jest.fn(),
    ...IntlData,
  };

  it('should render correctly with equal required and facultative fields', () => {
    const wrapper = shallow(
      <ReplyForm
        form={{ fields: [requiredText, requiredRadio, facultativeSelect, facultativeRanking] }}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with minority of required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        form={{ fields: [requiredText, facultativeCheckbox, requiredRadio, facultativeSelect, facultativeRanking] }}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with majority of required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        form={{ fields: [requiredText, requiredRadio, facultativeRanking] }}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with only required fields', () => {
    const wrapper = shallow(
      <ReplyForm
        form={{ fields: [requiredText, requiredRadio] }}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with only facultatives fields', () => {
    const wrapper = shallow(
      <ReplyForm
        form={{ fields: [facultativeCheckbox, facultativeSelect, facultativeRanking] }}
        {...props}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
