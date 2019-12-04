// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { QuestionChoiceAdminModal } from './QuestionChoiceAdminModal';
import { intlMock } from '../../mocks';

const defaultProps = {
  show: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  member: 'string',
  isCreating: true,
  kind: 'string',
  dispatch: jest.fn(),
  formName: 'string',
  type: 'string',
  intl: intlMock,
};

describe('<ProposalUserVoteItem />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<QuestionChoiceAdminModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly button', () => {
    const props = {
      ...defaultProps,
      type: 'button',
    };
    const wrapper = shallow(<QuestionChoiceAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly radio', () => {
    const props = {
      ...defaultProps,
      type: 'radio',
    };
    const wrapper = shallow(<QuestionChoiceAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when not creating', () => {
    const props = {
      ...defaultProps,
      isCreating: false,
    };
    const wrapper = shallow(<QuestionChoiceAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when not show', () => {
    const props = {
      ...defaultProps,
      show: false,
    };
    const wrapper = shallow(<QuestionChoiceAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly when not show and not creating', () => {
    const props = {
      ...defaultProps,
      show: false,
      isCreating: false,
    };
    const wrapper = shallow(<QuestionChoiceAdminModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
