// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import { ICON_NAME } from '~ds/Icon/Icon';

storiesOf('Design system|ButtonQuickAction', module).add('default', () => {
  return <ButtonQuickAction icon={ICON_NAME.TRASH} variantColor="primary" label="Supprimer" />;
});
