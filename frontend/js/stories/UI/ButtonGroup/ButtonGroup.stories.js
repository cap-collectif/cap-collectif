// @flow
import * as React from 'react';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Text from '~ui/Primitives/Text';

export default { title: 'Design system/ButtonGroup', component: ButtonGroup };

const Template = (args: any) => (
  <ButtonGroup {...args}>
    <Button variant="primary" variantColor="primary" variantSize="medium" size="medium">
      <Text>Bonjour</Text>
    </Button>
    <Button variant="primary" variantColor="primary" variantSize="medium" size="medium">
      <Text>Au revoir</Text>
    </Button>
  </ButtonGroup>
);

export const main = Template.bind({});
main.storyName = 'Default';
