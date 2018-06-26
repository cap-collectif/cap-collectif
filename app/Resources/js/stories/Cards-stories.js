// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import CardProject from './CardProject';
import CardProposal from './CardProposal';
import CardTheme from './CardTheme';

const Row = styled.div.attrs({
  className: 'row',
})`
  display: flex;
  flex-wrap: wrap;
`;

const Col = styled.div.attrs({
  className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
})`
  display: flex;
`;

const openProject = {
  title: 'Rénovation du gymnase',
  theme: ['Immobilier', 'Transport'],
  counters: {
    list: ['5 projets', '10 articles', '2 évènements', '4 idées'],
    comments: {
      value: '15',
      label: 'commentaires',
    },
    votes: {
      value: '3',
      label: 'votes',
    },
  },
  tags: {
    tag: 'Justice',
    localisation: 'Maurepas Patton',
    contributions: '10 contributions',
    participations: '15 contributions',
  },
  content:
    'Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.',
  label: 'danger',
  status: {
    name: 'Soumis au vote',
    color: 'status--success',
  },
  cover: 'https://source.unsplash.com/collection/1127828',
  type: {
    title: 'Consultation',
    color: '#337ab7',
  },
  user: {
    name: 'Jean Pierre',
    avatar: 'https://source.unsplash.com/collection/181462',
    publicationDate: '1 février 2015',
  },
  step: {
    bsStyle: 'success',
    now: 50,
    label: 'en cours',
    className: null,
    status: 'open',
    actionLink: 'Participer',
    remainingTime: {
      value: '10',
      label: 'jours restants',
    },
  },
};

const continuousProject = {
  title: 'Croissance, innovation, disruption',
  theme: ['Immobilier', 'Transport'],
  counters: {
    list: ['5 projets', '10 articles', '2 évènements', '4 idées'],
    comments: {
      value: '15',
      label: 'commentaires',
    },
    votes: {
      value: '3',
      label: 'votes',
    },
  },
  tags: {
    tag: 'Transport',
    localisation: 'Nord Saint-Martin',
    contributions: '10 contributions',
    participations: '15 contributions',
  },
  content:
    'Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.',
  label: 'success',
  status: {
    name: 'Aucun statut',
    color: 'status--primary',
  },
  cover: 'https://source.unsplash.com/collection/1127828',
  type: {
    title: 'Questionnaire',
    color: '#999999',
  },
  user: {
    name: 'Jean Pierre',
    avatar: 'https://source.unsplash.com/collection/181462',
    publicationDate: '1 février 2015',
  },
  step: {
    bsStyle: 'success',
    now: 100,
    status: 'open',
    label: 'Participation en continue',
    className: null,
    actionLink: 'Participer',
    remainingTime: {
      value: '27',
      label: 'jours restants',
    },
  },
};

const endedProject = {
  title: "Startégie technologique de l'État et services publics",
  theme: ['Immobilier', 'Transport'],
  counters: {
    list: ['5 projets', '10 articles', '2 évènements', '4 idées'],
    comments: {
      value: '15',
      label: 'commentaires',
    },
    votes: {
      value: '3',
      label: 'votes',
    },
  },
  tags: {
    tag: 'Politique',
    localisation: 'Beaulieu',
    contributions: '10 contributions',
    participations: '15 contributions',
  },
  content:
    'Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.',
  label: 'primary',
  status: {
    name: 'Vote gagné',
    color: 'status--danger',
  },
  cover: 'https://source.unsplash.com/collection/1127828',
  type: {
    title: 'Budget participatif',
    color: '#5bc0de',
  },
  user: {
    name: 'Jean Pierre',
    avatar: 'https://source.unsplash.com/collection/181462',
    publicationDate: '1 février 2015',
  },
  step: {
    now: 100,
    label: 'Terminé',
    status: 'ended',
    className: 'progress-bar_grey',
    actionLink: 'Voir le résultat',
    remainingTime: {},
  },
};

const toComeProject = {
  title: 'Projet à venir',
  theme: ['Immobilier', 'Transport'],
  counters: {
    list: ['5 projets', '10 articles', '2 évènements', '4 idées'],
    comments: {
      value: '15',
      label: 'commentaires',
    },
    votes: {
      value: '3',
      label: 'votes',
    },
  },
  tags: {
    tag: 'Aménagement',
    localisation: 'Beauregard',
    contributions: '10 contributions',
    participations: '15 contributions',
  },
  content:
    'Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.',
  label: 'info',
  status: {
    name: 'Aucun statut',
    color: 'status--info',
  },
  cover: 'https://source.unsplash.com/collection/1127828',
  type: {
    title: 'Interpellation',
    color: '#5cb85c',
  },
  user: {
    name: 'Jean Pierre',
    avatar: 'https://source.unsplash.com/collection/181462',
    publicationDate: '1 février 2015',
  },
  step: {
    now: 100,
    label: 'à venir',
    status: 'future',
    actionLink: null,
    className: 'progress-bar_empty',
    remainingTime: {
      label: 'Commence le lundi 12 décembre',
    },
  },
};

storiesOf('Cards', module)
  .add('Project Card', () => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Project Card {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Cards-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr />
        <Row>
          <Col>
            <CardProject project={openProject} />
          </Col>
          <Col>
            <CardProject project={endedProject} />
          </Col>
          <Col>
            <CardProject project={continuousProject} />
          </Col>
          <Col>
            <CardProject project={toComeProject} />
          </Col>
        </Row>
      </div>
    );
  })
  .add('Proposal Card', () => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Proposal Card {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Cards-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr />
        <Row>
          <Col>
            <CardProposal proposal={openProject} />
          </Col>
          <Col>
            <CardProposal proposal={endedProject} />
          </Col>
          <Col>
            <CardProposal proposal={continuousProject} />
          </Col>
          <Col>
            <CardProposal proposal={toComeProject} />
          </Col>
        </Row>
      </div>
    );
  })
  .add('Theme cards', () => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          Theme Card {' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Cards-stories.js">
            <i className="small cap cap-setting-gear-1"/>
          </a>
        </h1>
        <hr />
        <Row>
          <Col>
            <CardTheme theme={openProject} />
          </Col>
          <Col>
            <CardTheme theme={endedProject} />
          </Col>
          <Col>
            <CardTheme theme={continuousProject} />
          </Col>
          <Col>
            <CardTheme theme={toComeProject} />
          </Col>
        </Row>
      </div>
    );
  })
