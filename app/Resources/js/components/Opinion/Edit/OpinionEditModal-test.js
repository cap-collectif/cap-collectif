// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditModal } from './OpinionEditModal';

describe('<OpinionEditModal />', () => {
  const props = {
    show: true,
    opinion: {},
    step: {},
    submitting: false,
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
