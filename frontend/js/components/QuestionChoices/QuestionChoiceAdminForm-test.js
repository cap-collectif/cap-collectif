// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { change } from 'redux-form';
import { QuestionChoiceAdminForm } from './QuestionChoiceAdminForm';
import { intlMock } from '../../mocks';
import { getDeleteQuestions } from '../Question/QuestionAdmin-test';

jest.mock('redux-form', () => ({
  change: jest.fn(),
}));

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
  jumps: [],
  formName: 'formName',
  oldMember: 'oldMember',
  type: 'type',
  intl: intlMock,
  importedResponses: null,
  questions: [
    {
      id: 'UXVlc3Rpb246NDYzOQ==',
      __typename: 'SimpleQuestion',
      title: 'j1',
      number: 3,
      private: false,
      position: 232,
      required: false,
      hidden: false,
      helpText: null,
      jumps: [],
      destinationJumps: [],
      alwaysJumpDestinationQuestion: null,
      description: null,
      type: 'text',
      isRangeBetween: false,
      rangeMin: null,
      rangeMax: null,
    },
  ],
  currentQuestionId: 'UXVlc3Rpb246NDYzOQ==',
};

const deleteChoicesProps = {
  ...props,
  fields: { length: 2, map: jest.fn(), remove: jest.fn() },
  oldMember: 'questions[0]',
  currentQuestionId: 'UXVlc3Rpb246NDYxNg==',
  choices: [
    {
      id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmQxMjctNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
      title: 'a',
      description: null,
      color: null,
      image: null,
    },
    {
      id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmUwODYtNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
      title: 'b',
      description: null,
      color: null,
      image: null,
    },
  ],
  jumps: [
    {
      id: '70a4cf4f-71fb-11eb-bd45-0242ac120002',
      origin: {
        id: 'UXVlc3Rpb246NDYxNg==',
      },
      destination: {
        id: 'UXVlc3Rpb246NDYxOQ==',
        title: 'j1',
        number: 2,
      },
      conditions: [
        {
          id: '70a4e4b7-71fb-11eb-bd45-0242ac120002',
          operator: 'IS',
          question: {
            id: 'UXVlc3Rpb246NDYxNg==',
            title: 'Q1',
            type: 'radio',
          },
          value: {
            id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmQxMjctNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
            title: 'a',
          },
        },
      ],
    },
    {
      id: '70a4faa0-71fb-11eb-bd45-0242ac120002',
      origin: {
        id: 'UXVlc3Rpb246NDYxNg==',
      },
      destination: {
        id: 'UXVlc3Rpb246NDYxOA==',
        title: 'j2',
        number: 3,
      },
      conditions: [
        {
          id: '70a50e2c-71fb-11eb-bd45-0242ac120002',
          operator: 'IS',
          question: {
            id: 'UXVlc3Rpb246NDYxNg==',
            title: 'Q1',
            type: 'radio',
          },
          value: {
            id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmUwODYtNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
            title: 'b',
          },
        },
      ],
    },
  ],
  questions: getDeleteQuestions(),
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

  it('should dispatch change 2 times when I delete 1 choice related to a jump and there are still other choices related to the jump', () => {
    const wrapper = shallow(<QuestionChoiceAdminForm {...deleteChoicesProps} />);
    const instance = wrapper.instance();

    const remainingJump = deleteChoicesProps.questions[0].jumps[1];

    instance.onDelete('UXVlc3Rpb25DaG9pY2U6NTJjNmQxMjctNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy', 0);
    expect(change.mock.calls[0][1]).toBe('questions.0.jumps');
    expect(change.mock.calls[0][2]).toStrictEqual([remainingJump]);
    expect(change.mock.calls[1][1]).toBe('questions.1.destinationJumps');
    expect(change.mock.calls[1][2]).toStrictEqual([]);
    expect(change.mock.calls.length).toBe(2);
  });

  it('should dispatch change 3 times when I delete the only choice related to the jump', () => {
    const deleteChoicesPropsWithOneJump = {
      ...deleteChoicesProps,
      questions: getDeleteQuestions(null, 1),
    };

    const wrapper = shallow(<QuestionChoiceAdminForm {...deleteChoicesPropsWithOneJump} />);
    const instance = wrapper.instance();

    instance.onDelete('UXVlc3Rpb25DaG9pY2U6NTJjNmQxMjctNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy', 0);

    // all jumps are removed from the question so we call dispatch a second time to set the alwaysJumpDestinationQuestion field to null
    expect(change.mock.calls[0][1]).toBe('questions.0.jumps');
    expect(change.mock.calls[0][2]).toStrictEqual([]);

    expect(change.mock.calls[1][1]).toBe('questions.0.alwaysJumpDestinationQuestion');
    expect(change.mock.calls[1][2]).toBe(null);

    expect(change.mock.calls[2][1]).toBe('questions.1.destinationJumps');
    expect(change.mock.calls[2][2]).toStrictEqual([]);

    expect(change.mock.calls.length).toBe(3);
  });
});
