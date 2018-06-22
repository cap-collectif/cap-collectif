// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentForm } from './CommentForm';
import { intlMock } from '../../mocks';

const props = {
  submitting: false,
  pristine: false,
  invalid: false,
  handleSubmit: jest.fn(),
  isAnswer: false,
  comment: 'test of comment',
  object: 'proposal1',
  uri: 'proposal_forms/proposalForm1/proposals',
  intl: intlMock,
};

const userProps = {
  user: {
    displayName: 'admin',
  },
};

describe('<CommentForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentForm {...props} user={false} />);
    wrapper.setState({ expanded: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with user', () => {
    const wrapper = shallow(<CommentForm {...props} {...userProps} />);
    wrapper.setState({ expanded: true });
    expect(wrapper).toMatchSnapshot();
  });
});
