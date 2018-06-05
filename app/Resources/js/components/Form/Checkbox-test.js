/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import Checkbox from './Checkbox';

describe('<Checkbox />', () => {
  const field = {
    id: 11,
    type: 'checkbox',
    slug: 'pour-quel-type-d-epreuve-etes-vous-pret-a-acheter-des-places',
    helpText: 'Plusieurs choix sont possibles',
    required: true,
    isOtherAllowed: false,
    choices: [
      { id: 20, label: 'Athlétisme', value: 'athletisme' },
      { id: 21, label: 'Natation', value: 'natation' },
      { id: 22, label: 'Sports collectifs', value: 'sport-co' },
      { id: 23, label: 'Sports individuels' },
    ],
  };
  const props = {
    label: 'label',
    id: 'reply-1',
    value: {
      labels: 'label',
    },
    returnValue: false,
    disabled: false,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    getGroupStyle: jest.fn(),
    renderFormErrors: jest.fn(),
  };
  const props2 = {
    label: 'label',
    id: 'reply-1',
    returnValue: true,
    disabled: false,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    getGroupStyle: jest.fn(),
    renderFormErrors: jest.fn(),
  };
  it('should render correctly', () => {
    const wrapper = shallow(<Checkbox field={field} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with an other field', () => {
    const wrapper = shallow(<Checkbox field={{ ...field, isOtherAllowed: true }} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly and checkbox return value', () => {
    const wrapper = shallow(<Checkbox field={field} {...props2} />);
    expect(wrapper).toMatchSnapshot();
  });
});
