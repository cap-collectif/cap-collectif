/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MultipleRadioButton from './MultipleRadioButton';
import { COLORS } from '~/components/Ui/Form/Input/Radio/Radio';
import { TYPE_FORM } from '~/constants/FormConstants';

const baseProps = {
  id: '1',
  typeForm: TYPE_FORM.DEFAULT,
  field: {
    id: '123',
    type: 'checkbox',
    isOtherAllowed: false,
    choices: [
      {
        id: '1',
        label: 'Pomme',
        color: COLORS.SUCCESS,
      },
      {
        id: '2',
        label: 'Poire',
        color: COLORS.INFO,
      },
    ],
    checked: false,
    helpText: "Ceci est un texte d'aide",
    description: 'Ceci est une description',
  },
  onChange: jest.fn(),
  onBlur: jest.fn(),
  disabled: false,
  value: null,
};

const props = {
  basic: {
    ...baseProps,
  },
  disabled: {
    ...baseProps,
    disabled: true,
  },
  inQuestionnaire: {
    ...baseProps,
    typeForm: TYPE_FORM.QUESTIONNAIRE,
  },
};

describe('<MultipleRadioButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<MultipleRadioButton {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when disabled', () => {
    const wrapper = shallow(<MultipleRadioButton {...props.disabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when in questionnaire form', () => {
    const wrapper = shallow(<MultipleRadioButton {...props.inQuestionnaire} />);
    expect(wrapper).toMatchSnapshot();
  });
});
