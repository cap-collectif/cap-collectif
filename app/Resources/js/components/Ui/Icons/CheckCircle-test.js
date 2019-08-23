// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import CheckCircle from './CheckCircle';

describe('<CheckCircle />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'check-circle',
      size: 20,
      color: 'black',
    };
    const wrapper = shallow(<CheckCircle {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
