// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Section } from './Section';

describe('<Section />', () => {
  const props = {
    section: {},
    consultation: {},
    level: 0
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Section {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
