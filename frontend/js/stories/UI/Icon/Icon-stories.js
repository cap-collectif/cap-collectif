// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import Grid from '~ui/Primitives/Layout/Grid';
import Flex from '~ui/Primitives/Layout/Flex';

storiesOf('Design system|Icons', module)
  .add('default', () => {
    const listIconName = ((Object.values(ICON_NAME).sort(): any): string[]);

    return (
      <Grid gridGap={6} autoFit>
        {listIconName.map(icon => (
          <Flex key={icon} direction="column" align="center">
            <Icon name={ICON_NAME[icon]} size={ICON_SIZE.LG} />
            <Text>{icon}</Text>
          </Flex>
        ))}
      </Grid>
    );
  })
  .add('with size', () => {
    const listIconName = ((Object.values(ICON_NAME).sort(): any): string[]);
    const listIconSize = ((Object.keys(ICON_SIZE).reverse(): any): string[]);

    return (
      <Grid gridGap={6} templateColumns={['1fr 1fr 1fr 1fr']}>
        {listIconName.map(icon => (
          <Flex key={icon} borderRadius="normal" direction="column">
            <Flex direction="row">
              {listIconSize.map(size => (
                <Icon name={ICON_NAME[icon]} size={ICON_SIZE[size]} />
              ))}
            </Flex>
            <Text>{icon}</Text>
          </Flex>
        ))}
      </Grid>
    );
  });
