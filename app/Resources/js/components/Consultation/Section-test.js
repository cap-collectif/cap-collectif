// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Section } from './Section';
import IntlData from '../../translations/FR';

describe('<Section />', () => {
  const props = {
    ...IntlData,
    section: {},
    consultation: {},
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Section {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
