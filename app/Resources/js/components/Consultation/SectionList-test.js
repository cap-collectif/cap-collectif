// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionList } from './SectionList';
import IntlData from '../../translations/FR';

describe('<SectionList />', () => {
  const props = {
    ...IntlData,
    section: {},
    consultation: {},
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
