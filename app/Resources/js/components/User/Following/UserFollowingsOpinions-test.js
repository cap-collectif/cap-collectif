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
      edges: [
        {
          node: {
            url: 'http://carte.perdu.com',
            id: 'opinion1',
            title: "Une carte de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            url: 'http://gps.perdu.com',
            id: 'opinion2',
            title: "Un GPS de l'internet",
            project: {
              id: 'project1',
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
