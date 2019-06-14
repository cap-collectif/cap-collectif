// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { ReplyCreateFormWrapper } from './ReplyCreateFormWrapper';

describe('<ReplyCreateFormWrapper />', () => {
  const formContribuable = {
    contribuable: true,
    multipleRepliesAllowed: true,
    viewerReplies: [{ id: '289' }],
    anonymousAllowed: true,
    phoneConfirmationRequired: false,
    id: '2',
    description: null,
    $refType,
    $fragmentRefs,
  };
  const formContribuableWithoutMultipleVotes = {
    contribuable: true,
    multipleRepliesAllowed: false,
    viewerReplies: [{ id: '326' }, { id: '289' }],
    anonymousAllowed: false,
    phoneConfirmationRequired: false,
    id: '4',
    description: null,
    $refType,
    $fragmentRefs,
  };
  const formNotContribuable = {
    contribuable: false,
    multipleRepliesAllowed: false,
    viewerReplies: [{ id: '326' }, { id: '289' }],
    anonymousAllowed: false,
    phoneConfirmationRequired: false,
    id: '3',
    description: null,
    $refType,
    $fragmentRefs,
  };
  const user = {
    id: '23',
    username: 'Tom',
    isEmailConfirmed: true,
    isPhoneConfirmed: true,
    phone: '0606060606',
    isAdmin: false,
    isEvaluer: false,
    email: 'test@gmail.com',
    newEmailToConfirm: null,
    media: null,
    roles: [],
    displayName: 'TomTom',
    uniqueId: '234',
    _links: {
      profile: 'http://test.com',
    },
  };

  it('should render an alert an a disabled form when form is contribuable and user is not logged in', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formContribuable} user={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render an alert an a disabled form when form is contribuable and doesn't allow multiple votes and user has already votes", () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formContribuableWithoutMultipleVotes} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formNotContribuable} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(
      <ReplyCreateFormWrapper questionnaire={formContribuable} user={user} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
