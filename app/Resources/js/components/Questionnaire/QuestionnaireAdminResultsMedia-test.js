// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsMedia } from './QuestionnaireAdminResultsMedia';
import { relayPaginationMock, $refType } from '../../mocks';

describe('<QuestionnaireAdminResultsMedia />', () => {
  const props = {
    relay: relayPaginationMock,
    questionId: '87970',
    mediaQuestion: {
      id: '768',
      $refType,
      responses: {
        edges: [
          {
            node: {
              id: '8Y97',
              medias: [
                { url: 'file.png', name: 'file.png', size: '678887', contentType: 'image/png' },
                {
                  url: 'file2.pdf',
                  name: 'file2.pdf',
                  size: '321678887',
                  contentType: 'image/pdf',
                },
              ],
            },
          },
          {
            node: {
              id: '865497',
              medias: [
                { url: 'file3.jpg', name: 'file3.jpg', size: '887', contentType: 'image/jpeg' },
              ],
            },
          },
          {
            node: {
              id: '8697',
              medias: [
                { url: 'file4.png', name: 'file4.png', size: '678', contentType: 'image/png' },
                { url: 'file5.pdf', name: 'file5.pdf', size: '90000000', contentType: 'image/pdf' },
                { url: 'file10.pdf', name: 'file10.pdf', size: '932100', contentType: 'image/pdf' },
              ],
            },
          },
          {
            node: {
              id: '898977',
              medias: [
                { url: 'file6.jpg', name: 'file6.jpg', size: '7890887', contentType: 'image/jpeg' },
              ],
            },
          },
          {
            node: {
              id: '97',
              medias: [
                {
                  url: 'file7.jpeg',
                  name: 'file7.jpeg',
                  size: '456887',
                  contentType: 'image/jpeg',
                },
              ],
            },
          },
          {
            node: {
              id: '89',
              medias: [
                { url: 'file8.png', name: 'file8.png', size: '1234887', contentType: 'image/png' },
              ],
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

  it('renders correctly mediaQuestion responses', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsMedia {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
