// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { PrivacyModal } from './PrivacyModal';

describe('<PrivacyModal />', () => {
  const props = {
    privacyContent: '<p>Privacy content</p>',
  };
  it('should render correctly open', () => {
    const wrapper = shallow(<PrivacyModal {...props} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly close', () => {
    const wrapper = shallow(<PrivacyModal {...props} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
