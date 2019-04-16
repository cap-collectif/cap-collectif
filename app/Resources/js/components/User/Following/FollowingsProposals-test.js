/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { FollowingsProposals } from './FollowingsProposals';

describe('<FollowingsProposals />', () => {
  // $FlowFixMe $refType
  const viewer = {
    followingProposals: {
      edges: [
        {
          node: {
            url: 'http://carte.perdu.com',
            id: 'proposal1',
            title: "Une carte de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            url: 'http://gps.perdu.com',
            id: 'proposal2',
            title: "Un GPS de l'internet",
            project: {
              id: 'project1',
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
