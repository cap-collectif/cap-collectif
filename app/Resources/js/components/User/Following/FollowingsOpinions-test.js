/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsOpinions } from './FollowingsOpinions';

describe('<FollowingsOpinions />', () => {
  // $FlowFixMe $refType
  const viewer = {
    followingOpinions: {
      edges: [
        {
          node: {
            show_url: 'http://carte.perdu.com',
            id: 'opinion1',
            title: "Une carte de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'http://gps.perdu.com',
            id: 'opinion2',
            title: "Un GPS de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'https://randomstreetview.com/',
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
    const wrapper = shallow(<FollowingsOpinions viewer={viewer} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render following opinion close', () => {
    const wrapper = shallow(<FollowingsOpinions viewer={viewer} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
