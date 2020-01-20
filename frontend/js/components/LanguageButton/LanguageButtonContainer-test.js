// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { LanguageButtonContainer } from './LanguageButtonContainer';

describe('<LanguageButtonContainer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButtonContainer />);
    expect(wrapper).toMatchSnapshot();
  });
});
