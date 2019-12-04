// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DeleteButtonPopover } from './DeleteButtonPopover';

describe('<DeleteButtonPopover />', () => {
  it('renders correctly', () => {
    const props = {
      handleValidate: jest.fn(),
      handleCancel: jest.fn(),
      id: '<mock-id/>',
    };
    const wrapper = shallow(<DeleteButtonPopover {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
