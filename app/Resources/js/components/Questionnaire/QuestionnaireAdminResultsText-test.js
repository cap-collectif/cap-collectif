// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsText } from './QuestionnaireAdminResultsText';
import { relayPaginationMock, $refType } from '../../mocks';

describe('<QuestionnaireAdminResultsText />', () => {
  const props = {
    relay: relayPaginationMock,
    questionId: '87970',
    simpleQuestion: {
      id: '768',
      $refType,
      responses: {
        edges: [
          {
            node: {
              id: '8Y97',
              value:
                '<p><span class="ql-size-large">heeey</span></p><p><strong>c\'est ma réponse</strong></p>',
            },
          },
          {
            node: {
              id: '865497',
              value: "c'est ma réponse",
            },
          },
          {
            node: {
              id: '8697',
              value: "<p>c'est ma réponse</p>",
            },
          },
          {
            node: {
              id: '898977',
              value: "<p><strong>c'est ma réponse</strong></p>",
            },
          },
          {
            node: {
              id: '97',
              value: "<p>c'est une autre réponse</p>",
            },
          },
          {
            node: {
              id: '89',
              value: "<p>c'est une sixième réponse</p>",
            },
          },
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '8Y97',
          endCursor: '97',
        },
      },
    },
  };

  it('renders correctly simpleQuestion responses', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsText {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
