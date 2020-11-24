// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';

storiesOf('Design system|Button/Tertiary/Primary', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" size="medium" variantColor="primary" disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary/Danger', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" size="medium" variantColor="danger" disabled>
        Supprimer
      </Button>
    );
  });

/* # TERTIARY WITH ICON # */

storiesOf('Design system|Button/Tertiary with icon/Primary', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="primary" icon={ICON_NAME.ADD}>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" size="medium" variantColor="primary" icon={ICON_NAME.ADD} disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with icon/Danger', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="danger" icon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        size="medium"
        variantColor="danger"
        icon={ICON_NAME.TRASH}
        disabled>
        Supprimer
      </Button>
    );
  });

/* # TERTIARY WITH ALTERNATIVE # */

storiesOf('Design system|Button/Tertiary with alternative/Primary', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="primary" alternative>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" size="medium" variantColor="primary" alternative disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with alternative/Danger', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" size="small" variantColor="danger" alternative>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" size="medium" variantColor="danger" alternative disabled>
        Supprimer
      </Button>
    );
  });

/* # TERTIARY WITH ICON ALTERNATIVE # */

storiesOf('Design system|Button/Tertiary with icon alternative/Primary', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        size="small"
        variantColor="primary"
        icon={ICON_NAME.ADD}
        alternative>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        size="medium"
        variantColor="primary"
        icon={ICON_NAME.ADD}
        alternative
        disabled>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with icon alternative/Danger', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        size="small"
        variantColor="danger"
        icon={ICON_NAME.TRASH}
        alternative>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        size="medium"
        variantColor="danger"
        icon={ICON_NAME.TRASH}
        alternative
        disabled>
        Supprimer
      </Button>
    );
  });
