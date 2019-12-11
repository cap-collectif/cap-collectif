// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import DeleteButton from './DeleteButton';

describe('<DeleteButton />', () => {
  it('renders correctly', () => {
    const props = {
      onClick: jest.fn(),
    };
    const wrapper = shallow(<DeleteButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
