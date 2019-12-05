// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InlineList from '../../../components/Ui/List/InlineList';

storiesOf('Core|List/InlineList', module).add('default', () => (
  <InlineList>
    <li>Projet 1</li>
    <li>Projet 2</li>
    <li>Projet 3</li>
  </InlineList>
));

storiesOf('Core|List/InlineList', module).add('with separator', () => (
  <InlineList separator="•">
    <li>5 projets</li>
    <li>
      <a href="https://ui.cap-collectif.com/?selectedKind=List">10 articles</a>
    </li>
    <li>2 évènements</li>
  </InlineList>
));
