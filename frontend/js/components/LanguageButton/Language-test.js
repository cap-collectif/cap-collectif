// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Language } from './Language';
import { $refType } from '~/mocks';

describe('<Language />', () => {
  const defaultProps = {
    language: { $refType, translated: true, name: 'Français' },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Language {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when not translated', () => {
    const props = {
      language: { $refType, translated: false, name: 'Français' },
    };
    const wrapper = shallow(<Language {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
