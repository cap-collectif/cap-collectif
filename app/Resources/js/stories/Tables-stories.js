// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import styled from 'styled-components';
import Table from '../components/Ui/Table/Table';

const Row = styled.div.attrs({
  className: 'row',
})`
  display: flex;
  flex-wrap: wrap;
`;

const Col = styled.div.attrs({
  className: 'col-xs-12',
})`
  display: flex;
`;

storiesOf('Tables', module).add(
  'Table',
  withInfo({
    source: false,
    propTablesExclude: [Col, Row, Table],
    text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      // Table component
      import Table form '../../Ui/Table/Table';
      
      <Table tableLayoutFixed hover bordered>
        <thead>
          <tr>
            <th>Titre de la proposition</th>
            <th>Référence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ravalement de la façade</td>
            <td>1-7</td>
          </tr>
        </tbody>
      </Table>
      ~~~
    
    `,
  })(() => (
    <div className="ml-30 mr-30 storybook-container">
      <h1>
        StackedNav{' '}
        <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Tables-stories.js">
          <i className="small cap cap-github" />
        </a>
      </h1>
      <hr />
      <h3>Basic table</h3>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>Titre de la proposition</th>
                <th>Référence</th>
                <th>Zone géographique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ravalement de la façade</td>
                <td>1-7</td>
                <td>Maurepas Patton</td>
              </tr>
              <tr>
                <td>Plantation de tulipes</td>
                <td>1-4</td>
                <td>Nord Saint-Martin</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <h3>Table with Bordered and hover props</h3>
      <Row>
        <Col>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Titre de la proposition</th>
                <th>Référence</th>
                <th>Zone géographique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ravalement de la façade</td>
                <td>1-7</td>
                <td>Maurepas Patton</td>
              </tr>
              <tr>
                <td>Plantation de tulipes</td>
                <td>1-4</td>
                <td>Nord Saint-Martin</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <h3>Table with fix layout</h3>
      <Row>
        <Col>
          <Table tableLayoutFixed>
            <thead>
              <tr>
                <th>Titre de la proposition</th>
                <th>Référence</th>
                <th>Zone géographique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ravalement de la façade</td>
                <td>1-7</td>
                <td>Maurepas Patton</td>
              </tr>
              <tr>
                <td>Plantation de tulipes</td>
                <td>1-4</td>
                <td>Nord Saint-Martin</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  )),
);
