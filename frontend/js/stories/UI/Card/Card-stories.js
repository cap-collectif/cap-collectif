// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Flex from '~ui/Primitives/Layout/Flex';
import Card from '~ds/Card/Card';
import Text from '~ui/Primitives/Text';

storiesOf('Design system|Card', module).add('default', () => {
  return (
    <Flex align="center" gridGap={2}>
      <Card>
        <Text>Card</Text>
      </Card>
    </Flex>
  );
});
