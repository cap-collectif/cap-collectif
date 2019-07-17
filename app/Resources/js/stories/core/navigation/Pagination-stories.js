// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from 'react-bootstrap';
import { number, boolean } from '@storybook/addon-knobs';
import Pagination from '../../../components/Utils/Pagination';

storiesOf('Core|Navigation/Pagination', module).add(
  'default',
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
