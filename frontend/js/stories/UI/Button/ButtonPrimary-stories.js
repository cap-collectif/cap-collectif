// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';

storiesOf('Design system|Button/Primary/Primary', module)
  .add('small', () => {
    return (
      <Button variant="primary" variantSize="small" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('medium', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('big', () => {
    return (
      <Button variant="primary" variantSize="big" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="primary" disabled>
        Ajouter
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="primary" isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Primary/Danger', module)
  .add('small', () => {
    return (
      <Button variant="primary" variantSize="small" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('medium', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('big', () => {
    return (
      <Button variant="primary" variantSize="big" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="danger" disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="danger" isLoading>
        Supprimer
      </Button>
    );
  });

storiesOf('Design system|Button/Primary with icon/Primary', module)
  .add('small', () => {
    return (
      <Button variant="primary" variantSize="small" variantColor="primary" leftIcon={ICON_NAME.ADD}>
        Ajouter
      </Button>
    );
  })
  .add('medium', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="primary" leftIcon={ICON_NAME.ADD}>
        Ajouter
      </Button>
    );
  })
  .add('big', () => {
    return (
      <Button variant="primary" variantSize="big" variantColor="primary" leftIcon={ICON_NAME.ADD}>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="primary"
        variantSize="medium"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        disabled>
        Ajouter
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button
        variant="primary"
        variantSize="medium"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Primary with icon/Danger', module)
  .add('small', () => {
    return (
      <Button variant="primary" variantSize="small" variantColor="danger" leftIcon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('medium', () => {
    return (
      <Button variant="primary" variantSize="medium" variantColor="danger" leftIcon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('big', () => {
    return (
      <Button variant="primary" variantSize="big" variantColor="danger" leftIcon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="primary"
        variantSize="medium"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button
        variant="primary"
        variantSize="medium"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        isLoading>
        Supprimer
      </Button>
    );
  });
