/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsTab } from './FollowingsTab';
import { $refType } from '../../../mocks';

describe('<FollowingsTab />', () => {
  const viewer = {
    $refType,
    followingOpinions: {
      edges: [
        {
          node: {
            url: 'http://carte.perdu.com',
            id: 'opinion1',
            title: "Une carte de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            },
          },
        },
        {
          node: {
            url: 'http://gps.perdu.com',
            id: 'opinion2',
            title: "Un GPS de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            },
          },
        },
        {
          node: {
            url: 'https://randomstreetview.com/',
            id: 'opinion3',
            title: 'Go  nowhere',
            project: {
              id: 'project2',
            },
          },
        },
      ],
    },
    followingProposals: {
      edges: [
        {
          node: {
            url: 'http://carte.perdu.com',
            id: 'proposal1',
            title: "Une carte de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            },
          },
        },
        {
          node: {
            url: 'http://gps.perdu.com',
            id: 'proposal2',
            title: "Un GPS de l'internet",
            project: {
              id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            },
          },
        },
        {
          node: {
            url: 'https://randomstreetview.com/',
            id: 'proposal3',
            title: 'Go  nowhere',
            project: {
              id: 'project2',
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
        viewer={{ followingOpinions: { edges: [] }, followingProposals: { edges: [] } }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
