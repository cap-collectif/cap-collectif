// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { QuestionChoiceAdminForm } from './QuestionChoiceAdminForm';
import { intlMock } from '../../mocks';

const props = {
  dispatch: jest.fn(),
  fields: { length: 1, map: jest.fn(), remove: jest.fn() },
  choices: [
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
  importedResponses: null,
};

describe('<ProposalUserVoteItem />', () => {
  it('should render correctly', () => {
    const withResponse = {
      ...props,
      importedResponses: {
        data: [{ title: 'response1' }, { title: 'response2' }, { title: 'response3' }],
      },
    };
    const wrapper = shallow(<QuestionChoiceAdminForm {...withResponse} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly modal to import file opened', () => {
    const wrapper = shallow(<QuestionChoiceAdminForm {...props} />);
    wrapper.setState({
      showModal: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly modal to edit question', () => {
    const wrapper = shallow(<QuestionChoiceAdminForm {...props} />);
    wrapper.setState({
      editIndex: 3,
      editMember: 'questions[0].choices[3]',
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without choices', () => {
    const propsNoQuestionChoices = {
      ...props,
      choices: [],
    };
    const wrapper = shallow(<QuestionChoiceAdminForm {...propsNoQuestionChoices} />);
    expect(wrapper).toMatchSnapshot();
  });
});
