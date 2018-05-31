/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Radio from './Radio';

describe('<Radio />', () => {
  const field = {
    id: 12,
    type: 'radio',
    slug: 'quel-est-ton-athlete-favori',
    helpText: 'Un seul choix possible',
    required: true,
    isOtherAllowed: false,
    choices: [
      { id: 24, label: 'Maxime Arrouard' },
      { id: 25, label: 'Spylou Super Sayen' },
      { id: 26, label: 'Cyril Lage' },
      { id: 27, label: 'Superman' },
    ],
  };
  const props = {
    id: 'reply-1',
    label: 'label',
    onChange: jest.fn(),
    getGroupStyle: jest.fn(),
    renderFormErrors: jest.fn(),
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Radio field={field} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other allowed', () => {
    const wrapper = shallow(<Radio field={{ ...field, isOtherAllowed: true }} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
