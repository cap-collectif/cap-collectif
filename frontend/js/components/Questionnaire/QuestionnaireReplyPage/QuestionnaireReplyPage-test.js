// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import { QuestionnaireReplyPage } from './QuestionnaireReplyPage';
import { $fragmentRefs, $refType } from '~/mocks';

const props = {
  history: createMemoryHistory(),
  submitReplyForm: jest.fn(),
  resetReplyForm: jest.fn(),
  questionnaire: {
    step: {
      $fragmentRefs,
    },
    viewerReplies: [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ],
    $refType,
  },
  reply: {
    $fragmentRefs,
    $refType,
    id: '1',
    createdAt: '2020-01-24T08:28:03.955Z',
    publishedAt: '2020-01-24T09:28:03.955Z',
    questionnaire: {
      $fragmentRefs,
    },
  },
};

describe('<QuestionnaireReplyPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireReplyPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
