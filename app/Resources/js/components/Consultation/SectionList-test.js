// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SectionList } from './SectionList';

describe('<SectionList />', () => {
  const props = {
    section: {},
    consultation: {},
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
