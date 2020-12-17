// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';
import Text from '~ui/Primitives/Text';
import Grid from '~ui/Primitives/Layout/Grid';
import Flex from '~ui/Primitives/Layout/Flex';

storiesOf('Design system|SpotIcon', module)
  .add('default', () => {
    const listIconName = ((Object.values(SPOT_ICON_NAME).sort(): any): string[]);

    return (
      <Grid gridGap={6} autoFit>
        {listIconName.map(icon => (
          <Flex key={icon} direction="column" align="center">
            <SpotIcon name={SPOT_ICON_NAME[icon]} size={SPOT_ICON_SIZE.LG} />
            <Text>{icon}</Text>
          </Flex>
        ))}
      </Grid>
    );
  })
  .add('with size', () => {
    const listIconName = ((Object.values(SPOT_ICON_NAME).sort(): any): string[]);
    const listIconSize = ((Object.keys(SPOT_ICON_SIZE).reverse(): any): string[]);

    return (
      <Grid gridGap={6} templateColumns={['1fr 1fr 1fr 1fr']}>
        {listIconName.map(icon => (
          <Flex key={icon} borderRadius="normal" direction="column">
            <Flex direction="row">
              {listIconSize.map(size => (
                <SpotIcon name={SPOT_ICON_NAME[icon]} size={SPOT_ICON_SIZE[size]} />
              ))}
            </Flex>
            <Text>{icon}</Text>
          </Flex>
        ))}
      </Grid>
    );
  });
