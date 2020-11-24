// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';

storiesOf('Design system|Button/Link/Default', module)
  .add('default', () => {
    return (
      <Button variant="link" size="small" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="link" size="medium" variantColor="primary" disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Link/Danger', module)
  .add('default', () => {
    return (
      <Button variant="link" size="small" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="link" size="medium" variantColor="danger" disabled>
        Supprimer
      </Button>
    );
  });
