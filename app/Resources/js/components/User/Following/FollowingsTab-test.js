/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsTab } from './FollowingsTab';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<FollowingsTab />', () => {
  const viewer = {
    $refType,
    $fragmentRefs,
    followingOpinions: {
      totalCount: 2,
      edges: [
        {
          node: {
            $fragmentRefs,
            id: 'opinion1',
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              title: "Une carte de l'internet",
              url: 'http://carte.perdu.com',
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            id: 'opinion2',
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              url: 'http://gps.perdu.com',
              title: "Un GPS de l'internet",
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            id: 'opinion3',
            project: {
              id: 'project2',
              url: 'https://randomstreetview.com/',
              title: 'Go  nowhere',
            },
          },
        },
      ],
    },
    followingProposals: {
      totalCount: 3,
      edges: [
        {
          node: {
            $fragmentRefs,
            id: 'proposal1',
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              url: 'http://carte.perdu.com',
              title: "Une carte de l'internet",
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            id: 'proposal2',
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
              url: 'http://gps.perdu.com',
              title: "Un GPS de l'internet",
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            id: 'proposal3',
            project: {
              id: 'project2',
              url: 'https://randomstreetview.com/',
              title: 'Go  nowhere',
            },
          },
        },
      ],
    },
  };

  it('should render a list of contribution', () => {
    const wrapper = shallow(<FollowingsTab viewer={viewer} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render an empty list', () => {
    const wrapper = shallow(
      <FollowingsTab
        viewer={{
          $refType,
          $fragmentRefs,
          followingOpinions: { totalCount: 0, edges: [] },
          followingProposals: { totalCount: 0, edges: [] },
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
