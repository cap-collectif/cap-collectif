// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { DisplaySettings } from './DisplaySettings';

const props = {
  synthesis: {},
  submitting: false,
  handleSubmit: jest.fn(),
};

describe('<DisplaySettings />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DisplaySettings {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
