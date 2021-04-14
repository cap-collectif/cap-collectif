// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { change } from 'redux-form';
import { QuestionAdmin, handleConfirmDelete } from './QuestionAdmin';

jest.mock('redux-form', () => ({
  change: jest.fn(),
}));

/**
 * indexes to remove from the array
 */
export const getDeleteQuestions = (questionIndex: ?number, jumpIndex: ?number) => {
  const questions = [
    {
      id: 'UXVlc3Rpb246NDYxNg==',
      __typename: 'MultipleChoiceQuestion',
      title: 'Q1',
      number: 1,
      private: false,
      position: 18,
      required: false,
      hidden: false,
      helpText: null,
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
      destinationJumps: [],
      alwaysJumpDestinationQuestion: {
        id: 'UXVlc3Rpb246NDYxNw==',
        title: 'always go to',
        number: 4,
      },
      description: null,
      type: 'radio',
      isOtherAllowed: false,
      randomQuestionChoices: false,
      groupedResponsesEnabled: false,
      responseColorsDisabled: false,
      validationRule: null,
      choices: {
        edges: [
          {
            node: {
              title: 'a',
              id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmQxMjctNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
              description: null,
              color: null,
              image: null,
            },
          },
          {
            node: {
              title: 'b',
              id: 'UXVlc3Rpb25DaG9pY2U6NTJjNmUwODYtNzFmYi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
              description: null,
              color: null,
              image: null,
            },
          },
          {
            node: {
              title: 'c',
              id: 'UXVlc3Rpb25DaG9pY2U6YTFlZTY5MWQtNzIxZi0xMWViLWJkNDUtMDI0MmFjMTIwMDAy',
              description: null,
              color: null,
              image: null,
            },
          },
        ],
        totalCount: 3,
        pageInfo: {
          hasNextPage: false,
        },
      },
    },
    {
      id: 'UXVlc3Rpb246NDYxOQ==',
      __typename: 'SimpleQuestion',
      title: 'j1',
      number: 2,
      private: false,
      position: 19,
      required: false,
      hidden: false,
      helpText: null,
      jumps: [],
      destinationJumps: [
        {
          id: '70a4cf4f-71fb-11eb-bd45-0242ac120002',
          origin: {
            id: 'UXVlc3Rpb246NDYxNg==',
            title: 'Q1',
          },
        },
      ],
      alwaysJumpDestinationQuestion: null,
      description: null,
      type: 'text',
      isRangeBetween: false,
      rangeMin: null,
      rangeMax: null,
    },
    {
      id: 'UXVlc3Rpb246NDYxOA==',
      __typename: 'SimpleQuestion',
      title: 'j2',
      number: 3,
      private: false,
      position: 20,
      required: false,
      hidden: false,
      helpText: null,
      jumps: [],
      destinationJumps: [
        {
          id: '70a4faa0-71fb-11eb-bd45-0242ac120002',
          origin: {
            id: 'UXVlc3Rpb246NDYxNg==',
            title: 'Q1',
          },
        },
      ],
      alwaysJumpDestinationQuestion: null,
      description: null,
      type: 'text',
      isRangeBetween: false,
      rangeMin: null,
      rangeMax: null,
    },
    {
      id: 'UXVlc3Rpb246NDYxNw==',
      __typename: 'SimpleQuestion',
      title: 'always go to',
      number: 4,
      private: false,
      position: 21,
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
  ];
  if (questionIndex) {
    questions.splice(questionIndex, 1);
  }
  if (jumpIndex) {
    questions[0].jumps.splice(jumpIndex, 1);
  }
  return questions;
};

describe('<QuestionAdmin />', () => {
  const questionBase = {
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
  };

  const props = {
    questions: [
      {
        ...questionBase,
        type: 'section',
        title: 'Section Title',
      },
    ],
    index: 0,
    provided: {
      innerRef: () => undefined,
      placeholder: '',
      droppableProps: {
        'data-rbd-droppable-context-id': '',
        'data-rbd-droppable-id': '',
      },
    },
    handleClickEdit: jest.fn(),
    handleClickDelete: jest.fn(),
    handleDeleteQuestionRow: jest.fn(),
    formName: 'form',
    dispatch: jest.fn(),
  };

  const propsQuestion = {
    ...props,
    questions: [
      {
        ...questionBase,
        type: 'text',
        title: 'Question Title',
      },
    ],
  };

  const propsMedia = {
    ...propsQuestion,
    questions: [
      {
        ...questionBase,
        type: 'medias',
        title: 'Question Title',
      },
    ],
  };

  const propsCheckbox = {
    ...propsQuestion,
    questions: [
      {
        ...questionBase,
        type: 'checkbox',
        title: 'Question Title',
      },
    ],
  };

  const deleteChoicesProps = {
    ...props,
    question: {
      id: 'UXVlc3Rpb246NDYxOQ==',
      __typename: 'SimpleQuestion',
      title: 'j1',
      number: 2,
      private: false,
      position: 19,
      required: false,
      hidden: false,
      helpText: null,
      jumps: [],
      destinationJumps: [
        {
          id: '70a4cf4f-71fb-11eb-bd45-0242ac120002',
          origin: {
            id: 'UXVlc3Rpb246NDYxNg==',
            title: 'Q1',
          },
        },
      ],
      alwaysJumpDestinationQuestion: null,
      description: null,
      type: 'text',
      isRangeBetween: false,
      rangeMin: null,
      rangeMax: null,
    },
    questions: getDeleteQuestions(),
  };

  it('render correctly a section', () => {
    const wrapper = shallow(<QuestionAdmin {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a text question', () => {
    const wrapper = shallow(<QuestionAdmin {...propsQuestion} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a medias question', () => {
    const wrapper = shallow(<QuestionAdmin {...propsMedia} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a checkbox question', () => {
    const wrapper = shallow(<QuestionAdmin {...propsCheckbox} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should call dispatch 1 time when I delete 1 question related to a jump and there are still other questions related to the jump', () => {
    const {
      question,
      questions,
      dispatch,
      formName,
      handleDeleteQuestionRow,
      index,
    } = deleteChoicesProps;

    handleConfirmDelete(question, questions, dispatch, formName, handleDeleteQuestionRow, index);
    expect(change.mock.calls[0][1]).toBe('questions.0.jumps');
    expect(change.mock.calls[0][2]).toStrictEqual(questions[0].jumps.splice(1, 1));
    expect(change.mock.calls.length).toBe(1);
  });

  it('should call dispatch 2 times when I delete the only question related to the jump', () => {
    const deleteQuestionsPropsWithOneJump = {
      ...deleteChoicesProps,
      questions: getDeleteQuestions(2, 1),
    };

    const {
      question,
      questions,
      dispatch,
      formName,
      handleDeleteQuestionRow,
      index,
    } = deleteQuestionsPropsWithOneJump;

    handleConfirmDelete(question, questions, dispatch, formName, handleDeleteQuestionRow, index);

    // all jumps are removed from the question so we call dispatch a second time to set the alwaysJumpDestinationQuestion field to null
    expect(change.mock.calls[0][1]).toBe('questions.0.jumps');
    expect(change.mock.calls[0][2]).toStrictEqual([]);

    expect(change.mock.calls[1][1]).toBe('questions.0.alwaysJumpDestinationQuestion');
    expect(change.mock.calls[1][2]).toBe(null);

    expect(change.mock.calls.length).toBe(2);
  });
});
