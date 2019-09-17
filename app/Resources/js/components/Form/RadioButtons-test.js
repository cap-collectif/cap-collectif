// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { RadioButtons } from './RadioButtons';

describe('<RadioButtons />', () => {
  const field = {
    id: '12',
    choices: [
      { id: '24', label: 'Maxime Arrouard', color: 'SUCCESS' },
      { id: '25', label: 'Spylou Super Sayen', color: 'SUCCESS' },
      { id: '26', label: 'Cyril Lage', color: 'SUCCESS' },
      { id: '27', label: 'Superman', color: 'SUCCESS' },
    ],
  };

  const props = {
    id: 'ranking',
    value: '',
    backgroundColor: '#0388cc',
    disabled: false,
    onChange: jest.fn(),
  };

  it('should render correctly', () => {
    const wrapper = shallow(<RadioButtons {...props} field={field} />);
    expect(wrapper).toMatchSnapshot();
  });
});
