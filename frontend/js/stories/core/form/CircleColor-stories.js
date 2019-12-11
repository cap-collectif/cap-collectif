// @flow
import * as React from 'react';
import { boolean, arrayObject } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import CircleColor, { type Color } from '../../../components/Ui/CircleColor/CircleColor';

storiesOf('Core|Form/CircleColor', module).add('CircleColor', () => {
  const editable = boolean('editable', true);
  const colors: Array<Color> = [
    { name: 'Blue', hexValue: '#3b88fd' },
    { name: 'Green', hexValue: '#3ad116' },
    { name: 'Orange', hexValue: '#f4b721' },
    { name: 'Red', hexValue: '#f75d56' },
    { name: 'Black with a long name to test padding lol', hexValue: '#000' },
  ];
  return (
    <CircleColor
      editable={editable}
      onChange={() => {}}
      defaultColor={colors[0]}
      colors={arrayObject('colors', colors)}
    />
  );
});
