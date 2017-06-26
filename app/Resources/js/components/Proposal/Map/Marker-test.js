/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Marker } from './Marker';

describe('<Marker />', () => {
  const marker = {
    url: 'http://test.com/marker',
    title: 'test',
    author: {
      url: 'http://test.com/user',
      username: 'testAuthor',
    },
  };

  it('should render a marker', () => {
    const wrapper = shallow(<Marker marker={marker} />);
    expect(wrapper).toMatchSnapshot();
  });
});
