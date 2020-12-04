// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME } from '~ds/Icon/Icon';

storiesOf('Design system|ButtonQuickAction', module)
  .add('primary', () => {
    return <ButtonQuickAction icon={ICON_NAME.ADD} variantColor="primary" label="Ajouter" />;
  })
  .add('danger', () => {
    return <ButtonQuickAction icon={ICON_NAME.TRASH} variantColor="danger" label="Supprimer" />;
  });
