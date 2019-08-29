/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { UserFollowingsOpinions } from './UserFollowingsOpinions';
import { $refType } from '../../../mocks';

describe('<UserFollowingsOpinions />', () => {
  const viewer = {
    $refType,
    followingOpinions: {
      totalCount: 3,
      edges: [
        {
          node: {
            id: 'opinion1',
            url: 'http://carte.perdu.com',
            title: "Une carte de l'internet",
            project: {
              id: 'project1',
              url: 'http://carte.perdu.com',
              title: "Un projet de l'internet",
            },
          },
        },
        {
          node: {
            id: 'opinion2',
            url: 'http://gps.perdu.com',
            title: "Un GPS de l'internet",
            project: {
              id: 'project2',
              url: 'http://carte.perdu.com',
              title: "Un projet de l'internet",
            },
          },
        },
        {
          node: {
            id: 'opinion3',
            url: 'https://randomstreetview.com/',
            title: 'Go  nowhere',
            project: {
              id: 'project3',
              url: 'http://carte.perdu.com',
              title: "Un projet de l'internet",
            },
          },
        },
      ],
    },
  };

  it('should render following opinion open', () => {
    const wrapper = shallow(<UserFollowingsOpinions viewer={viewer} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render following opinion close', () => {
    const wrapper = shallow(<UserFollowingsOpinions viewer={viewer} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
