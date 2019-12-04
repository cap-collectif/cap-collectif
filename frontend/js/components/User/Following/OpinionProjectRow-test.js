// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionProjectRow } from './OpinionProjectRow';
import { $refType, $fragmentRefs } from '../../../mocks';

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
    $refType,
    followingOpinions: {
      totalCount: 3,
      edges: [
        {
          node: {
            $fragmentRefs,
            project: {
              id: 'project1',
              url: 'https://www.2rconsulting.fr/',
              title: 'Recrutez Hervé !',
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            project: {
              id: 'project1',
              url: 'https://www.2rconsulting.fr/',
              title: 'Virer Julie',
            },
          },
        },
        {
          node: {
            $fragmentRefs,
            project: {
              id: 'project2',
              url: 'https://www.2rconsulting.fr/',
              title:
                'Faire des sessions de recrutement basé sur la destruction des autres parce que cest comme ça le monde du travail.',
            },
          },
        },
      ],
    },
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
    const wrapper = shallow(<OpinionProjectRow viewer={viewer} project={project1} />);
    wrapper.setState({ open: false });
    expect(wrapper).toMatchSnapshot();
  });
});
