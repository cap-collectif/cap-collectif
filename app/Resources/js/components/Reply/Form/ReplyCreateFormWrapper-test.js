/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ReplyCreateFormWrapper } from './ReplyCreateFormWrapper';

describe('<ReplyCreateFormWrapper />', () => {
  const formContribuable = {
    contribuable: true,
    multipleRepliesAllowed: true,
    viewerReplies: [{ id: 289 }],
  };
  const formContribuableWithoutMultipleVotes = {
    contribuable: true,
    multipleRepliesAllowed: false,
    viewerReplies: [{ id: 326 }, { id: 289 }],
  };
  const formNotContribuable = {
    contribuable: false,
  };

  it('should render an alert an a disabled form when form is contribuable and user is not logged in', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formContribuable} user={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render an alert an a disabled form when form is contribuable and doesn't allow multiple votes and user has already votes", () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formContribuableWithoutMultipleVotes} user={{}} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formNotContribuable} user={{}} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper questionnaire={formContribuable} user={{}} />);
    expect(wrapper).toMatchSnapshot();
  });
});
