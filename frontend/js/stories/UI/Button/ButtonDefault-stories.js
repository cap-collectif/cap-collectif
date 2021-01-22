// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';

storiesOf('Design system|Button', module).add('default', () => {
  return <Button>Ajouter</Button>;
});
