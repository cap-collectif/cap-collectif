// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SearchAddress } from './SearchAddress';

describe('<SearchAddress />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SearchAddress language="FR" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with address prefilled', () => {
    const wrapper = shallow(
      <SearchAddress language="FR" address="8 Passage de Londres, 67000 Strasbourg" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
