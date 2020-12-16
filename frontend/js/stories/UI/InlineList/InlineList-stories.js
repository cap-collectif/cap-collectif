// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InlineList from '~ds/InlineList/InlineList';
import Text from '~ui/Primitives/Text';

storiesOf('Design system|InlineList', module).add('default', () => {
  return (
    <InlineList separator="•">
      <Text>San francisco</Text>
      <Text>California love</Text>
      <Text>Floride</Text>
    </InlineList>
  );
});
