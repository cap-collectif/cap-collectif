// @flow
import * as React from 'react';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';
import Text from '~ui/Primitives/Text';
import Grid from '~ui/Primitives/Layout/Grid';
import Flex from '~ui/Primitives/Layout/Flex';

export default {
  title: 'Design system/SpotIcon',
  component: SpotIcon,
  argTypes: {
    name: {
      control: { type: 'select', options: ((Object.values(SPOT_ICON_NAME).sort(): any): string[]) },
    },
    size: {
      control: {
        type: 'select',
        options: ((Object.keys(SPOT_ICON_SIZE).reverse(): any): string[]),
      },
    },
  },
};

const listIconName = ((Object.values(SPOT_ICON_NAME).sort(): any): string[]);
const listIconSize = ((Object.keys(SPOT_ICON_SIZE).reverse(): any): string[]);
const Template = () => {
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
};

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

const withSizeTemplate = () => {
  return (
    <Grid gridGap={6} templateColumns={['1fr 1fr 1fr 1fr']}>
      {listIconName.map(icon => (
        <Flex key={icon} borderRadius="normal" direction="column">
          <Flex direction="row">
            {listIconSize.map(size => (
              <SpotIcon key={size} name={SPOT_ICON_NAME[icon]} size={SPOT_ICON_SIZE[size]} />
            ))}
          </Flex>
          <Text>{icon}</Text>
        </Flex>
      ))}
    </Grid>
  );
};

export const withSize = withSizeTemplate.bind({});
withSize.storyName = 'with size';
withSize.args = {};
