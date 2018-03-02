// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
// import { injectGlobal } from 'styled-components';
import Card from './Card';
import CardCustom from './CardCustom';
import CardProject from './CardProject';
import CardProposal from './CardProposal';
import Progress from './Progress';

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

storiesOf('Components', module)
  .add('Cards', () => {
    return (
      <div className="container">
        <h3>Customized Card</h3>
        <p>You can customized the card with "Knobs"</p>
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
        <Progress />
        <hr/>
        <h3>En cours</h3>
        <Progress />
        <hr/>
        <h3>Participation en continue</h3>
        <Progress />
        <hr/>
        <h3>Terminé</h3>
        <Progress />
        <hr/>
      </div>

    );
  });

