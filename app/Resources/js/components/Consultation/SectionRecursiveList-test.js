// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SectionRecursiveList } from './SectionRecursiveList';
import IntlData from '../../translations/FR';

describe('<SectionRecursiveList />', () => {
  const props = {
    ...IntlData,
    sections: [{}, {}],
    consultation: {},
  };

  it('renders correcty', () => {
    const wrapper = shallow(<SectionRecursiveList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
