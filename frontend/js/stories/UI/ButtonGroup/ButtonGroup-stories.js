// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Text from '~ui/Primitives/Text';

storiesOf('Design system|ButtonGroup', module).add('default', () => {
  return (
    <ButtonGroup>
      <Button variant="primary" variantColor="primary" size="medium">
        <Text>Bonjour</Text>
      </Button>
      <Button variant="primary" variantColor="primary" size="medium">
        <Text>Au revoir</Text>
      </Button>
    </ButtonGroup>
  );
});
