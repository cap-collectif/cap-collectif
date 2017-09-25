/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ReplyCreateFormWrapper } from './ReplyCreateFormWrapper';

describe('<ReplyCreateFormWrapper />', () => {
  const formContribuable = {
    contribuable: true,
    multipleRepliesAllowed: true,
  };
  const formContribuableWithoutMultipleVotes = {
    contribuable: true,
    multipleRepliesAllowed: false,
  };
  const formNotContribuable = {
    contribuable: false,
  };
  const userReplies = [{}];

  it('should render an alert an a disabled form when form is contribuable and user is not logged in', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper form={formContribuable} userReplies={userReplies} user={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render an alert an a disabled form when form is contribuable and doesn't allow multiple votes and user has already votes", () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper
        form={formContribuableWithoutMultipleVotes}
        userReplies={userReplies}
        user={{}}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper form={formNotContribuable} userReplies={userReplies} user={{}} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper form={formContribuable} userReplies={userReplies} user={{}} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
