// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditModal } from './OpinionEditModal';
import IntlData from '../../../translations/FR';

describe('<OpinionEditModal />', () => {
  const props = {
    ...IntlData,
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
