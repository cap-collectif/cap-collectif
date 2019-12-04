/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsProposals } from './FollowingsProposals';
import { $refType } from '../../../mocks';

describe('<FollowingsProposals />', () => {
  const viewer = {
    $refType,
    followingProposals: {
      totalCount: 3,
      edges: [
        {
          node: {
            id: 'proposal1',
            url: 'http://carte.perdu.com',
            title: "Une carte de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              url: 'http://carte.perdu.com',
              title: "Une carte de l'internet",
            },
          },
        },
        {
          node: {
            id: 'proposal2',
            url: 'http://gps.perdu.com',
            title: "Un GPS de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              url: 'http://carte.perdu.com',
              title: "Une carte de l'internet",
            },
          },
        },
        {
          node: {
            id: 'proposal3',
            url: 'https://randomstreetview.com/',
            title: 'Go  nowhere',
            project: {
              id: 'project2',
              url: 'http://carte.perdu.com',
              title: "Une carte de l'internet",
            },
          },
        },
      ],
    },
  };

  it('should render following proposal open', () => {
    const wrapper = shallow(<FollowingsProposals viewer={viewer} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render following proposal close', () => {
    const wrapper = shallow(<FollowingsProposals viewer={viewer} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
