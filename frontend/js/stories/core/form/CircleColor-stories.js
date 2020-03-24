// @flow
import * as React from 'react';
import { boolean, arrayObject } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import CircleColor, { type Color } from '../../../components/Ui/CircleColor/CircleColor';

export const colors: Array<Color> = [
  { label: 'Blue', hexValue: '#3b88fd', name: 'primary' },
  { label: 'Green', hexValue: '#3ad116', name: 'default' },
  { label: 'Orange', hexValue: '#f4b721', name: 'danger' },
  { label: 'Black with a long name to test padding lol', hexValue: '#000', name: 'success' },
];

storiesOf('Core|Form/CircleColor', module).add('CircleColor', () => {
  const editable = boolean('editable', true);

  return (
    <CircleColor
      editable={editable}
      onChange={() => {}}
      defaultColor={colors[0]}
      colors={arrayObject('colors', colors)}
    />
  );
});
