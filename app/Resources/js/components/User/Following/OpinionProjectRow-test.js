// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionProjectRow } from './OpinionProjectRow';

describe('<OpinionProjectRow />', () => {
  const project1 = {
    title: 'Création du statut de Fungénieur',
    url:
      'https://www.jobteaser.com/fr/companies/sii/newsfeed/recruitment-12945-qu-est-ce-qu-un-fungenieur',
    id: 'project1',
  };

  const project2 = {
    title: 'Se perdre sur internet',
    url: 'http://theuselessweb.com',
    id: 'project2',
  };

  const viewer = {
    followingOpinions: {
      edges: [
        {
          node: {
            show_url: 'https://www.2rconsulting.fr/',
            id: 'opinion1',
            title: 'Recrutez Hervé !',
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'https://www.2rconsulting.fr/',
            id: 'opinion2',
            title: 'Virer Julie',
            project: {
              id: 'project1',
            },
          },
        },
        {
          node: {
            show_url: 'https://www.2rconsulting.fr/',
            id: 'opinion3',
            title:
              'Faire des sessions de recrutement basé sur la destruction des autres parce que cest comme ça le monde du travail.',
            project: {
              id: 'project2',
            },
          },
        },
      ],
    },
  };
  const viewerWithoutProjectOpinion = {
    followingOpinions: [],
  };

  it('should render the project 1 with its proposal displayed', () => {
    const wrapper = shallow(<OpinionProjectRow viewer={viewer} project={project1} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the project 2 with its proposal displayed', () => {
    const wrapper = shallow(<OpinionProjectRow viewer={viewer} project={project2} />);
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render close collapse', () => {
    const wrapper = shallow(
      <OpinionProjectRow viewer={viewerWithoutProjectOpinion} project={project1} />,
    );
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
