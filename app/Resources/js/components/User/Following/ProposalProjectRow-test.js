// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalProjectRow } from './ProposalProjectRow';

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
    followingProposals: {
      edges: [
        {
          node: {
            show_url: 'http://carte.perdu.com',
            id: 'proposal1',
            title: "Une carte de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'http://gps.perdu.com',
            id: 'proposal2',
            title: "Un GPS de l'internet",
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'https://randomstreetview.com/',
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
  const viewerWithoutProjectProposal = {
    followingProposals: [],
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
    const wrapper = shallow(
      <ProposalProjectRow viewer={viewerWithoutProjectProposal} project={project1} />,
    );
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
