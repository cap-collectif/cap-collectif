// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { ListGroupItem } from 'react-bootstrap';
import ListGroupFlush from '../../../components/Ui/List/ListGroupFlush';

storiesOf('Core|List/ListGroupFlush', module).add('default', () => (
  <ListGroupFlush>
    <ListGroupItem>Paragraph 1</ListGroupItem>
    <ListGroupItem>Paragraph 2</ListGroupItem>
    <ListGroupItem>
      <div>Left block</div>
      <div>Center block</div>
      <div>Right block</div>
    </ListGroupItem>
  </ListGroupFlush>
));
