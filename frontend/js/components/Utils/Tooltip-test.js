// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Tooltip from './Tooltip';

describe('<Tooltip />', () => {
  const props = {
    children: 'child',
    id: 'id',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<Tooltip {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
