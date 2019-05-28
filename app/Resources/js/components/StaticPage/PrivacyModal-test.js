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
    const props1 = {
      ...props,
      title: 'new-title',
    };
    const wrapper = shallow(<PrivacyModal {...props1} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly close', () => {
    const props2 = {
      ...props,
      linkKeyword: 'and-the',
    };
    const wrapper = shallow(<PrivacyModal {...props2} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
