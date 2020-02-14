// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ShowMore from './ShowMore';

describe('<ShowMore/>', () => {
  it('should render correctly', () => {
    const props = {
      onClick: jest.fn(),
    };
    const wrapper = shallow(<ShowMore {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
