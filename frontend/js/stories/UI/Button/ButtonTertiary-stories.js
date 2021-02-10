// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';

storiesOf('Design system|Button/Tertiary/Primary', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" variantSize="small" variantColor="primary">
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="primary" disabled>
        Ajouter
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="primary" isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary/Danger', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" variantSize="small" variantColor="danger">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="danger" disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="danger" isLoading>
        Supprimer
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary/Hierarchy', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" variantSize="small" variantColor="hierarchy">
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="hierarchy" disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="hierarchy" isLoading>
        Supprimer
      </Button>
    );
  });

/* # TERTIARY WITH ICON # */

storiesOf('Design system|Button/Tertiary with icon/Primary', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="small"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
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
        variant="tertiary"
        variantSize="medium"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with icon/Danger', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="small"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
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
        variant="tertiary"
        variantSize="medium"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        isLoading>
        Supprimer
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with icon/Hierarchy', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="small"
        variantColor="hierarchy"
        leftIcon={ICON_NAME.TRASH}>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="hierarchy"
        leftIcon={ICON_NAME.TRASH}
        disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="hierarchy"
        leftIcon={ICON_NAME.TRASH}
        isLoading>
        Supprimer
      </Button>
    );
  });

/* # TERTIARY WITH ALTERNATIVE # */

storiesOf('Design system|Button/Tertiary with alternative/Primary', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" variantSize="small" variantColor="primary" alternative>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="primary" alternative disabled>
        Ajouter
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="primary" alternative isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with alternative/Danger', module)
  .add('default', () => {
    return (
      <Button variant="tertiary" variantSize="small" variantColor="danger" alternative>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="danger" alternative disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button variant="tertiary" variantSize="medium" variantColor="danger" alternative isLoading>
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
        variantSize="small"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        alternative>
        Ajouter
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        alternative
        disabled>
        Ajouter
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="primary"
        leftIcon={ICON_NAME.ADD}
        alternative
        isLoading>
        Ajouter
      </Button>
    );
  });

storiesOf('Design system|Button/Tertiary with icon alternative/Danger', module)
  .add('default', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="small"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        alternative>
        Supprimer
      </Button>
    );
  })
  .add('disabled', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        alternative
        disabled>
        Supprimer
      </Button>
    );
  })
  .add('loading', () => {
    return (
      <Button
        variant="tertiary"
        variantSize="medium"
        variantColor="danger"
        leftIcon={ICON_NAME.TRASH}
        alternative
        isLoading>
        Supprimer
      </Button>
    );
  });
