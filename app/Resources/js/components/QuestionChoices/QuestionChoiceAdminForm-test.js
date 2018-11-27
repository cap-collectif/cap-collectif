// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { QuestionChoiceAdminForm } from './QuestionChoiceAdminForm';
import { intlMock } from '../../mocks';

const props = {
  dispatch: jest.fn(),
  fields: { length: 1, map: jest.fn(), remove: jest.fn() },
  questionChoices: [
    {
      id: '1',
      title: 'test',
      description: 'thisisnotatest',
      color: 'red',
      image: Object,
    },
  ],
  formName: 'formName',
  oldMember: 'oldMember',
  type: 'type',
  intl: intlMock,
};

describe('<ProposalUserVoteItem />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<QuestionChoiceAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without questionChoices', () => {
    const propsNoQuestionChoices = {
      ...props,
      questionChoices: [],
    };
    const wrapper = shallow(<QuestionChoiceAdminForm {...propsNoQuestionChoices} />);
    expect(wrapper).toMatchSnapshot();
  });
});
