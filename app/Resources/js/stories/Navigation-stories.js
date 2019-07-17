// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Button, Nav } from 'react-bootstrap';
import { number, boolean } from '@storybook/addon-knobs';
import StackedNav from '../components/Ui/Nav/StackedNav';
import Pagination from '../components/Utils/Pagination';

storiesOf('Navigation', module)
  .add(
    'StackedNav',
    () => (
      <StackedNav>
        <div className="stacked-nav__header">
          <p>
            <i className="cap cap-android-menu mr-5" />
            <span>My plan</span>
          </p>
          <button className="btn-link p-0" href="#">
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
  )
  .add(
    'Pagination',
    () => {
      const nbPages = number('Number of pages', 10);
      const current = number('Current page', 8);
      const displayedPages = number('DisplayedPages', 5);
      const showFirst = boolean('Show first arrow', true);
      const showLast = boolean('Show last arrow', true);
      const showPrev = boolean('Show prev arrow', true);
      const showNext = boolean('Show next arrow', true);

      return (
        <Pagination
          nbPages={nbPages}
          current={current}
          displayedPages={displayedPages}
          onChange={() => {}}
          showFirst={showFirst}
          showLast={showLast}
          showPrev={showPrev}
          showNext={showNext}
        />
      );
    },
    {
      info: {
        propTablesExclude: [Button],
      },
    },
  );
