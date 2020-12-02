// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Spinner from '~ds/Spinner/Spinner';
import Flex from '~ui/Primitives/Layout/Flex';
import { ICON_SIZE } from '~ds/Icon/Icon';

const sizes = Object.entries(ICON_SIZE).map(([, value]) => value);

storiesOf('Design system|Spinner', module)
  .add('default', () => {
    return (
      <Flex align="center" gridGap={2} wrap="wrap">
        {sizes.map((size, i) => (
          <Spinner size={((size: any): string)} key={i} />
        ))}
      </Flex>
    );
  })
  .add('within a container', () => {
    return (
      <Flex
        width={100}
        height={100}
        align="center"
        justify="center"
        borderRadius="card"
        borderStyle="solid"
        borderColor="gray.150"
        bg="gray.100"
        borderWidth="1px">
        <Spinner size="xl" />
      </Flex>
    );
  })
  .add('with color', () => {
    return <Spinner size="xl" color="gray.500" />;
  });
