// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';

storiesOf('Design system|Button/Link/Default', module)
  .add('default', () => {
    return (
      <Button variant="link" variantSize="small" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="link" variantSize="medium" variantColor="primary" disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Link/Danger', module)
  .add('default', () => {
    return (
      <Button variant="link" variantSize="small" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="link" variantSize="medium" variantColor="danger" disabled>
        Supprimer
      </Button>
    );
  });
