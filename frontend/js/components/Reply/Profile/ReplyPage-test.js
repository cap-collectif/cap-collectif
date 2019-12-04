// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ReplyPage } from './ReplyPage';

describe('<ReplyPage />', () => {
  const userId = 'VXNlcjp1c2VyNQo=';

  it('should render correctly', () => {
    const wrapper = shallow(<ReplyPage isAuthenticated isProfileEnabled userId={userId} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with profile not enabled', () => {
    const wrapper = shallow(<ReplyPage isAuthenticated isProfileEnabled={false} userId={userId} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with profile not enabled and not authenticated', () => {
    const wrapper = shallow(
      <ReplyPage isAuthenticated={false} isProfileEnabled={false} userId={userId} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
