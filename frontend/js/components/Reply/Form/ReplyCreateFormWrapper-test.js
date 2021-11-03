// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '~/mocks';
import { ReplyCreateFormWrapper } from './ReplyCreateFormWrapper';

const baseProps = {
  user: {
    id: '23',
    username: 'Tom',
    isEmailConfirmed: true,
    isPhoneConfirmed: true,
    phone: '0606060606',
    isAdmin: false,
    isProjectAdmin: false,
    isOnlyProjectAdmin: false,
    isEvaluerOnLegacyTool: false,
    isEvaluerOnNewTool: false,
    email: 'test@gmail.com',
    newEmailToConfirm: null,
    media: null,
    roles: [],
    displayName: 'TomTom',
    uniqueId: '234',
    _links: {
      profile: 'http://test.com',
    },
  },
  questionnaire: {
    $refType,
    $fragmentRefs,
    id: '123',
    contribuable: true,
    multipleRepliesAllowed: true,
    viewerReplies: {
      totalCount: 1,
    },
    phoneConfirmationRequired: false,
    step: {
      isAnonymousParticipationAllowed: false,
    },
  },
  setIsShow: jest.fn(),
};

const props = {
  basic: baseProps,
  withoutMultipleVotes: {
    ...baseProps,
    questionnaire: {
      ...baseProps.questionnaire,
      multipleRepliesAllowed: false,
      viewerReplies: {
        totalCount: 2,
      },
    },
  },
  notContribuable: {
    ...baseProps,
    questionnaire: {
      ...baseProps.questionnaire,
      contribuable: false,
      multipleRepliesAllowed: false,
    },
  },
  notLoginUser: {
    ...baseProps,
    user: null,
  },
  anonymousParticipantsAllowed: {
    ...baseProps,
    questionnaire: {
      ...baseProps.questionnaire,
      step: {
        isAnonymousParticipationAllowed: true,
      },
    },
  },
};
describe('<ReplyCreateFormWrapper />', () => {
  it('should render no alert an an enabled form', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render no alert when anonymous particpants are allowed', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper {...props.anonymousParticipantsAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render an alert an a disabled form when form is contribuable and user is not logged in', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper {...props.notLoginUser} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render an alert an a disabled form when form is contribuable and doesn't allow multiple votes and user has already votes", () => {
    const wrapper = shallow(<ReplyCreateFormWrapper {...props.withoutMultipleVotes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should no alert an a disabled form when form is not contribuable', () => {
    const wrapper = shallow(<ReplyCreateFormWrapper {...props.notContribuable} />);
    expect(wrapper).toMatchSnapshot();
  });
});
