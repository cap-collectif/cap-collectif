// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import IntlData from '../../translations/FR';

describe('<OpinionList />', () => {
  const props = {
    ...IntlData,
    section: {},
    consultation: {},
  };

  it('renders correcty', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
