// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import { ProgressBar } from "react-bootstrap";
import CardProject from './CardProject';
import CardProposal from './CardProposal';
import CardTheme from './CardTheme';
import {Progress} from "../components/Ui/Progress";

const Row = styled.div.attrs({
  className: 'row'
})`
  display: flex;
  flex-wrap: wrap;
`;

const Col = styled.div.attrs({
  className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12'
})`
  display: flex;
`;

const openProject = {
  title: "Rénovation du gymnase",
  counters: {
    list: ["5 projets", "10 articles", "2 évènements", "4 idées"],
    comments: {
      value: "15",
      label: "commentaires",
    },
    votes: {
      value: "3",
      label: "votes",
    }
  },
  tags: {
    tag: "Justice",
    localisation: "Maurepas Patton",
  },
  content: "Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.",
  theme: "Immobilier, Transport",
  label: "danger",
  status: {
    name: "Soumis au vote",
    color: "status--success",
  },
  cover: "https://source.unsplash.com/random",
    type: {
    title: "Consultation",
      color: "#337ab7"
  },
  user: {
    name: "Jean Pierre",
    avatar: "https://source.unsplash.com/random",
  },
  step: {
    bsStyle: "success",
    now: 50,
    label: "en cours",
    className: null,
  }
};

const continuousProject = {
  title: "Croissance, innovation, disruption",
  theme: "Immobilier, Transport",
  counters: {
    list: ["5 projets", "10 articles", "2 évènements", "4 idées"],
    comments: {
      value: "15",
      label: "commentaires",
    },
    votes: {
      value: "3",
      label: "votes",
    }
  },
  tags: {
    tag: "Justice",
    localisation: "Maurepas Patton",
  },
  content: "Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.",
  label: "success",
  status: {
    name: "Aucun statut",
    color: "status--primary",
  },
  cover: "https://source.unsplash.com/random",
  type: {
    title: "Questionnaire",
    color: "#999999"
  },
  user: {
    name: "Jean Pierre",
    avatar: "https://source.unsplash.com/random",
  },
  step: {
    bsStyle: "success",
    now: 100,
    label: "Participation en continue",
    className: null,
  }
};

const endedProject = {
  title: "Startégie technologique de l'État et services publics",
  theme: "Immobilier, Transport",
  counters: {
    list: ["5 projets", "10 articles", "2 évènements", "4 idées"],
    comments: {
      value: "15",
      label: "commentaires",
    },
    votes: {
      value: "3",
      label: "votes",
    }
  },
  tags: {
    tag: "Justice",
    localisation: "Maurepas Patton",
  },
  content: "Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.",
  label: "primary",
  status: {
    name: "Vote gagné",
    color: "status--danger",
  },
  cover: "https://source.unsplash.com/random",
  type: {
    title: "Budget participatif",
    color: "#5bc0de"
  },
  user: {
    name: "Jean Pierre",
    avatar: "https://source.unsplash.com/random",
  },
  step: {
    now: 100,
    label: "Terminé",
    className: "progress-bar_grey",
  }
};

const toComeProject = {
  title: "Projet à venir",
  theme: "Immobilier, Transport",
  counters: {
    list: ["5 projets", "10 articles", "2 évènements", "4 idées"],
    comments: {
      value: "15",
      label: "commentaires",
    },
    votes: {
      value: "3",
      label: "votes",
    }
  },
  tags: {
    tag: "Justice",
    localisation: "Maurepas Patton",
  },
  content: "Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.",
  label: "info",
  status: {
    name: "Aucun statut",
    color: "status--info",
  },
  cover: "https://source.unsplash.com/random",
  type: {
    title: "Interpellation",
    color: "#5cb85c"
  },
  user: {
    name: "Jean Pierre",
    avatar: "https://source.unsplash.com/random",
  },
  step: {
    now: 100,
    label: "à venir",
    className: "progress-bar_empty",
  }
};

storiesOf('Components', module)
  .add('Cards', () => {
    return (
      <div className="container storybook-container">
        <h3>Project Card</h3>
        <hr/>
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
        <h3>Proposal Card</h3>
        <hr/>
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
        <h3>Theme Card</h3>
        <hr/>
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
  .add('Progress', () => {
    return (
      <div className="container storybook-container">
        <h3>À venir</h3>
        <Progress>
          <ProgressBar
            now={toComeProject.step.now}
            className={toComeProject.step.className}
            label={toComeProject.step.label}
          />
        </Progress>
        <h3>En cours</h3>
        <Progress>
          <ProgressBar
            now={openProject.step.now}
            bsStyle={openProject.step.bsStyle}
            className={openProject.step.className}
            label={openProject.step.label}
          />
        </Progress>
        <h3>Participation en continue</h3>
        <Progress>
          <ProgressBar
            now={continuousProject.step.now}
            bsStyle={continuousProject.step.bsStyle}
            className={continuousProject.step.className}
            label={continuousProject.step.label}
          />
        </Progress>
        <h3>Terminé</h3>
        <Progress>
          <ProgressBar
            now={endedProject.step.now}
            className={endedProject.step.className}
            label={endedProject.step.label}
          />
        </Progress>
      </div>

    );
  });

