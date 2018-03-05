// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
// import { injectGlobal } from 'styled-components';
import { ProgressBar } from "react-bootstrap";
import Card from './Card';
import CardCustom from './CardCustom';
import CardProject from './CardProject';
import CardProposal from './CardProposal';
import CardTheme from './CardTheme';

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

const project = {
  title: "Mon projet",
  type: {
    title: "Consultation",
    color: "#337ab7"
  }
};

storiesOf('Components', module)
  .add('Cards', () => {
    return (
      <div className="container storybook-container">
        <h3>Customized Card</h3>
        <p>You can customized the card with "Knobs" tab</p>
        <hr/>
        <Row>
          <Col>
            <CardCustom />
          </Col>
          <Col>
            <CardCustom />
          </Col>
          <Col>
            <CardCustom />
          </Col>
        </Row>
        <h3>Project Card</h3>
        <hr/>
        <Row>
          <Col>
            <CardProject />
          </Col>
          <Col>
            <CardProject />
          </Col>
          <Col>
            <CardProject />
          </Col>
        </Row>
        <h3>Proposal Card</h3>
        <hr/>
        <Row>
          <Col>
            <CardProposal />
          </Col>
          <Col>
            <CardProposal />
          </Col>
          <Col>
            <CardProposal />
          </Col>
        </Row>
        <h3>Theme Card</h3>
        <hr/>
        <Row>
          <Col>
            <CardTheme />
          </Col>
          <Col>
            <CardTheme />
          </Col>
          <Col>
            <CardTheme />
          </Col>
        </Row>
        <h3>Idea Card</h3>
        <hr/>
        <Row>
          <Col>
            <Card />
          </Col>
        </Row>
        <h3>event Card</h3>
        <hr/>
        <Row>
          <Col>
            <Card />
          </Col>
        </Row>
        <h3>New Card</h3>
        <hr/>
        <Row>
          <Col>
            <Card />
          </Col>
        </Row>
      </div>
    );
  })
  .add('Progress', () => {
    return (
      <div className="container">
        <h3>À venir</h3>
        <ProgressBar />
        <hr/>
        <h3>En cours</h3>
        <ProgressBar />
        <hr/>
        <h3>Participation en continue</h3>
        <ProgressBar />
        <hr/>
        <h3>Terminé</h3>
        <ProgressBar />
        <hr/>
      </div>

    );
  });

