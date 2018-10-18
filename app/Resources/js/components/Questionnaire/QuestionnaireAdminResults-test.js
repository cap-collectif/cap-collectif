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
          required: false,
          participants: { totalCount: 7 },
        },
        {
          $fragmentRefs,
          title: 'question type radio',
          type: 'radio',
          required: true,
          participants: { totalCount: 98 },
        },
        {
          $fragmentRefs,
          title: 'question type checkbox',
          type: 'checkbox',
          required: false,
          participants: { totalCount: 45 },
        },
        {
          $fragmentRefs,
          title: 'section',
          type: 'section',
          required: false,
          participants: { totalCount: 2 },
        },
        {
          $fragmentRefs,
          title: 'question type button',
          type: 'button',
          required: false,
          participants: { totalCount: 43 },
        },
        {
          $fragmentRefs,
          title: 'question type ranking',
          type: 'ranking',
          required: false,
          participants: { totalCount: 38 },
        },
        {
          $fragmentRefs,
          title: 'question type text',
          type: 'text',
          required: false,
          participants: { totalCount: 4 },
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
          required: false,
          participants: { totalCount: 0 },
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

  it('renders correctly without participants', () => {
    const wrapper = shallow(<QuestionnaireAdminResults {...withoutParticipants} />);
    expect(wrapper).toMatchSnapshot();
  });
});
