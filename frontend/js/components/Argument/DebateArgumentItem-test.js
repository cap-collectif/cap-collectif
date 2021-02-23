// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateArgumentItem } from './DebateArgumentItem';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<DebateArgumentItem />', () => {
  const defaultProps = {
    setDeleteModalInfo: jest.fn(),
    debateArgument: {
      $refType,
      $fragmentRefs,
      id: 'argumentPour42',
      body: 'Je suis pour',
      votes: {
        totalCount: 500,
      },
      debate: {
        id: 'debate-123',
        url: '/debate',
        step: {
          timeless: false,
          timeRange: {
            endAt: '2018-06-09T23:21:06+0200',
            startAt: '2018-04-09T23:21:06+0200',
          },
          id: 'step',
          title: 'Etape',
        },
      },
      type: 'FOR',
      viewerHasVote: false,
      viewerDidAuthor: false,
      publishedAt: '2018-04-09T23:21:06+0200',
    },
    isMobile: false,
  };

  it('render correcty', () => {
    const wrapper = shallow(<DebateArgumentItem {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('render correcty on mobile', () => {
    const wrapper = shallow(<DebateArgumentItem {...defaultProps} isMobile />);

    expect(wrapper).toMatchSnapshot();
  });
});
