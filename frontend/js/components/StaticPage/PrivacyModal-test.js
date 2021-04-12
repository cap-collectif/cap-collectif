// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { PrivacyModal } from './PrivacyModal';

const baseProps = {
  privacyContent: 'My privacy content',
  title: 'Thats my title',
};

const props = {
  basic: baseProps,
  withLinkKeyWord: {
    ...baseProps,
    linkKeyword: 'Thats the link keyword',
  },
};
describe('<PrivacyModal />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<PrivacyModal {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with link key work', () => {
    const wrapper = shallow(<PrivacyModal {...props.withLinkKeyWord} />);
    expect(wrapper).toMatchSnapshot();
  });
});
