// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginModal } from './LoginModal';
import IntlData from '../../../translations/FR';

describe('<LoginModal />', () => {
  const props = {
    ...IntlData,
    submitting: false,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('renders an hidden modal if not shown', () => {
    const wrapper = shallow(<LoginModal show={false} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
  });

  it('renders a visible modal if shown', () => {
    const wrapper = shallow(<LoginModal show {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
    expect(wrapper).toMatchSnapshot();
  });
});
