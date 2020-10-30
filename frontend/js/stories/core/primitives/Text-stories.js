// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import { FontSize } from '~ui/Primitives/constants';

storiesOf('Core|Primitives/Text', module).add('default', () => {
  return (
    <AppBox display="grid" gridGap={2} gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      <Text bg="red.300">I have a text, I have an Apple, hmmm, Apple Text</Text>
      <Text fontSize={FontSize.Xl4} bg="red.300" color="blue.800" p={2}>
        I have a bigger text, I have an Apple (and also a bigger padding), hmmm, Apple Text
      </Text>
    </AppBox>
  );
});
