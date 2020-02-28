// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { LanguageButtonContainer } from './LanguageButtonContainer';
import { features } from '~/redux/modules/default';

describe('<LanguageButtonContainer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButtonContainer features={features} />);
    expect(wrapper).toMatchSnapshot();
  });
});
