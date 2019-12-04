// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalProjectRow } from './ProposalProjectRow';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalProjectRow />', () => {
  const project1 = {
    title: 'Perdu sur internet ?',
    url: 'http://perdu.com',
    id: 'project1',
  };

  const project2 = {
    title: 'Se perdre sur internet',
    url: 'http://theuselessweb.com',
    id: 'project2',
  };

  const viewer = {
    $refType,
    followingProposals: {
      totalCount: 3,
      edges: [
        {
          node: {
            $fragmentRefs,
            project: {
              id: 'project1',
              url: 'http://carte.perdu.com',
              title: "Une carte de l'internet",
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            project: {
              id: 'project1',
              url: 'http://gps.perdu.com',
              title: "Un GPS de l'internet",
            },
          },
        },
        {
          node: {
            $fragmentRefs,
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

  it('should render the project 1 with his proposal displayed', () => {
    const wrapper = shallow(<ProposalProjectRow viewer={viewer} project={project1} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the project 2 with his proposal displayed', () => {
    const wrapper = shallow(<ProposalProjectRow viewer={viewer} project={project2} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render close collapse', () => {
    const wrapper = shallow(<ProposalProjectRow viewer={viewer} project={project1} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
