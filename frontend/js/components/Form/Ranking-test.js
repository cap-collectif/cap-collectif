// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Ranking from './Ranking';

describe('<Ranking />', () => {
  const field = {
    id: 12,
    helpText: "Texte d'aide",
    required: false,
    choices: [
      { id: 24, label: 'Maxime Arrouard' },
      { id: 25, label: 'Spylou Super Sayen' },
      { id: 26, label: 'Cyril Lage' },
      { id: 27, label: 'Superman' },
    ],
  };

  const props = {
    id: 'ranking',
    label: 'label',
    labelClassName: 'label-class',
    getGroupStyle: jest.fn(),
    renderFormErrors: jest.fn(),
    onChange: jest.fn(),
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Ranking {...props} field={field} />);
    expect(wrapper).toMatchSnapshot();
  });
});
