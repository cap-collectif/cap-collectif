// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, Nav } from 'react-bootstrap';
import StackedNav from '../../../components/Ui/Nav/StackedNav';

storiesOf('Core|Navigation/StackedNav', module).add(
  'default',
  () => (
    <StackedNav>
      <div className="stacked-nav__header">
        <p>
          <i className="cap cap-android-menu mr-5" />
          <span>My plan</span>
        </p>
        <button type="submit" className="btn-link p-0" href="#">
          <i className="cap cap-delete-1" />
        </button>
      </div>
      <div className="stacked-nav__list">
        <Nav>
          <li>
            <Button bsStyle="link" className="level--0">
              Title 1
            </Button>
            <Nav>
              <li>
                <Button bsStyle="link" className="level--1 active">
                  Title 1.1
                </Button>
                <Nav>
                  <li>
                    <Button bsStyle="link" className="level--2">
                      Title 1.1.1
                    </Button>
                    <Nav>
                      <li>
                        <Button bsStyle="link" className="level--3">
                          Title 1.1.1.1
                        </Button>
                      </li>
                    </Nav>
                  </li>
                </Nav>
              </li>
              <li>
                <Button bsStyle="link" className="level--1">
                  Title 1.2
                </Button>
              </li>
            </Nav>
          </li>
        </Nav>
        <Nav>
          <li>
            <Button bsStyle="link" className="level--0">
              Title 2
            </Button>
            <Nav>
              <li>
                <Button bsStyle="link" className="level--1">
                  Title 2.2
                </Button>
              </li>
            </Nav>
          </li>
        </Nav>
      </div>
      <div className="stacked-nav__footer">
        <Button bsStyle="link" className="p-0">
          <i className="cap cap-arrow-68 mr-5" />
          <span>Back to Top</span>
        </Button>
      </div>
    </StackedNav>
  ),
  {
    info: {
      propTablesExclude: [Button],
    },
  },
);
