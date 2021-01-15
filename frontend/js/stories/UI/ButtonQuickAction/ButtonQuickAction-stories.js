// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from 'storybook-addon-knobs';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';

const size = () => select('Sizes', ICON_SIZE, ICON_SIZE.MD);

storiesOf('Design system|ButtonQuickAction', module)
  .add('primary', () => {
    return <ButtonQuickAction icon={ICON_NAME.ADD} variantColor="primary" label="Ajouter" />;
  })
  .add('danger', () => {
    return <ButtonQuickAction icon={ICON_NAME.TRASH} variantColor="danger" label="Supprimer" />;
  })
  .add('with sizes', () => {
    return (
      <ButtonQuickAction
        size={size()}
        icon={ICON_NAME.THUMB_UP}
        variantColor="green"
        label="Voter"
      />
    );
  });
