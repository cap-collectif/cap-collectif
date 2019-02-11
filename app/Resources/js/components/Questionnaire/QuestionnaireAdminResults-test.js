// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResults } from './QuestionnaireAdminResults';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<QuestionnaireAdminResults />', () => {
  const allTypeOfQuestions = {
    questionnaire: {
      $refType,
      questions: [
        {
          $fragmentRefs,
          title: 'question type select',
          type: 'select',
          __typename: 'MultipleChoiceQuestion',
          required: false,
          private: false,
          participants: { totalCount: 7 },
          responses: { totalCount: 14 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type radio',
          type: 'radio',
          __typename: 'MultipleChoiceQuestion',
          required: true,
          private: false,
          participants: { totalCount: 98 },
          responses: { totalCount: 98 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type checkbox',
          type: 'checkbox',
          __typename: 'MultipleChoiceQuestion',
          required: false,
          private: false,
          participants: { totalCount: 45 },
          responses: { totalCount: 48 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'section',
          type: 'section',
          __typename: 'SectionQuestion',
          required: false,
          private: false,
          participants: { totalCount: 2 },
          responses: { totalCount: 4 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type button',
          type: 'button',
          __typename: 'MultipleChoiceQuestion',
          required: false,
          private: false,
          participants: { totalCount: 43 },
          responses: { totalCount: 43 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type ranking',
          type: 'ranking',
          __typename: 'MultipleChoiceQuestion',
          required: false,
          private: false,
          participants: { totalCount: 38 },
          responses: { totalCount: 0 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type text',
          type: 'text',
          __typename: 'SimpleQuestion',
          required: false,
          private: false,
          participants: { totalCount: 4 },
          responses: { totalCount: 4 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type number',
          type: 'number',
          __typename: 'SimpleQuestion',
          required: false,
          private: false,
          participants: { totalCount: 89 },
          responses: { totalCount: 89 },
          resultOpen: null,
        },
        {
          $fragmentRefs,
          title: 'question type number',
          type: 'medias',
          __typename: 'MediaQuestion',
          required: false,
          private: false,
          participants: { totalCount: 9 },
          responses: { totalCount: 9 },
          resultOpen: null,
        },
      ],
    },
    backgroundColor: '#897897',
  };

  const withoutQuestions = {
    questionnaire: {
      $refType,
      questions: [],
    },
    backgroundColor: '#897897',
  };

  const withoutParticipants = {
    questionnaire: {
      $refType,
      questions: [
        {
          $fragmentRefs,
          title: 'question type select',
          type: 'select',
          __typename: 'MultipleChoiceQuestion',
          required: false,
          private: true,
          participants: { totalCount: 0 },
          responses: { totalCount: 0 },
          resultOpen: null,
        },
      ],
    },
    backgroundColor: '#897897',
  };

  it('renders correctly all type of questions', () => {
    const wrapper = shallow(<QuestionnaireAdminResults {...allTypeOfQuestions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without questions', () => {
    const wrapper = shallow(<QuestionnaireAdminResults {...withoutQuestions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with private question & without participants', () => {
    const wrapper = shallow(<QuestionnaireAdminResults {...withoutParticipants} />);
    expect(wrapper).toMatchSnapshot();
  });
});
