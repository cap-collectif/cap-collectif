// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { FontForm } from './FontForm';
import { formMock } from '~/mocks';

const props = {
  ...formMock,
  handleFontLoading: jest.fn(),
  handleFormError: jest.fn(),
};

describe('<FontAdminContent />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<FontForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
