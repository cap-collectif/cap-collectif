// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import styled from 'styled-components';
import { Nav } from 'react-bootstrap';
import StackedNav from '../components/Ui/Nav/StackedNav';

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

storiesOf('Navs', module).add(
  'StackedNav',
  withInfo({
    source: false,
    propTablesExclude: [Col, Row],
    text: `
      <h2>Comment l'utiliser</h2>
    
      ~~~jsx
      // StackedNav component
      
      ~~~
    
    `,
  })(() => {
    return (
      <div className="ml-30 mr-30 storybook-container">
        <h1>
          StackedNav{' '}
          <a href="https://github.com/cap-collectif/platform/blob/master/app/Resources/js/stories/Cards-stories.js">
            <i className="small cap cap-github" />
          </a>
        </h1>
        <hr />
        <Row>
          <Col>
            <StackedNav>
              <div className="stacked-nav__header">
                <p>
                  <i className="cap cap-android-menu" />
                  <span>My plan</span>
                </p>
                <a href="">
                  <i className="cap cap-delete-1" />
                </a>
              </div>
              <div className="stacked-nav__list">
                <Nav>
                  <li className="level--0">
                    <a href="">Title 1</a>
                    <Nav>
                      <li className="level--1">
                        <a href="">Title 1.1</a>
                        <Nav>
                          <li className="level--2">
                            <a href="">Title 1.1.1</a>
                            <Nav>
                              <li className="level--3">
                                <a href="">Title 1.1.1.1</a>
                              </li>
                            </Nav>
                          </li>
                        </Nav>
                      </li>
                      <li className="level--1">
                        <a href="">Title 1.2</a>
                      </li>
                    </Nav>
                  </li>
                </Nav>
                <Nav>
                  <li className="level--0">
                    <a href="">Title 2</a>
                    <Nav>
                      <li className="level--1">
                        <a href="">Title 2.2</a>
                      </li>
                    </Nav>
                  </li>
                </Nav>
              </div>
              <div className="stacked-nav__footer">
                <a href="">
                  <i className="cap cap-arrow-68" />
                  <span>Back to Top</span>
                </a>
              </div>
            </StackedNav>
          </Col>
        </Row>
      </div>
    );
  }),
);
