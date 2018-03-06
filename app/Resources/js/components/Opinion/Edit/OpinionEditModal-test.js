// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditModal } from './OpinionEditModal';
import { intlMock } from '../../../mocks';

describe('<OpinionEditModal />', () => {
  const props = {
    intl: intlMock,
    show: true,
    opinion: {},
    step: {},
    submitting: false,
    dispatch: jest.fn()
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
