// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import styled from 'styled-components';
import PrivateBox from '../components/Ui/PrivateBox';

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

storiesOf('Boxes', module).add(
  'Private box',
  withInfo({
    source: false,
    propTablesExclude: [Col, Row],
    text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      import PrivateBox from '../components/Ui/PrivateBox';
      
      // Default private box
      <PrivateBox show>
        <div>
          Lorem ipsum dolor
        </div>
      </PrivateBox>
      
      // Private box with custom message
      <PrivateBox show message="my-translation-key">
        <div>
          Lorem ipsum dolor
        </div>
      </PrivateBox>
      ~~~
    
    `,
  })(() => (
    <div className="ml-30 mr-30 storybook-container">
      <h1>
        Private box{' '}
        <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Boxes-stories.js">
          <i className="small cap cap-github" />
        </a>
      </h1>
      <hr />
      <Row>
        <Col>
          <PrivateBox show>
            <div>Lorem ipsum dolor</div>
          </PrivateBox>
        </Col>
      </Row>
      <Row>
        <Col>
          <PrivateBox show message="my-translation-key">
            <div>Lorem ipsum dolor</div>
          </PrivateBox>
        </Col>
      </Row>
    </div>
  )),
);
