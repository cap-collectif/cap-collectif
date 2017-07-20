// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionRecursiveList } from './SectionRecursiveList';

describe('<SectionRecursiveList />', () => {
  const props = {
    sections: [{}, {}],
    consultation: {},
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionRecursiveList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
