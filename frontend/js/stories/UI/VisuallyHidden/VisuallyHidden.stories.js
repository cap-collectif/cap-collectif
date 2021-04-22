// @flow
import * as React from 'react';
import VisuallyHidden, { type VisuallyHiddenProps } from '~ds/VisuallyHidden/VisuallyHidden';
import AppBox from '~ui/Primitives/AppBox';

export default {
  title: 'Design system/VisuallyHidden',
  component: VisuallyHidden,
};

const Template = (args: VisuallyHiddenProps) => (
  <AppBox>
    <input
      type="text"
      value="Tu pourras voir le composant qu'avec ton lecteur d'écran"
      style={{ width: '400px' }}
    />
    <VisuallyHidden {...args} tabIndex={0}>
      Ceci est du contenu caché
    </VisuallyHidden>
  </AppBox>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};
