// @ts-nocheck
import * as React from 'react'
import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import type { Color } from '../../../components/Ui/CircleColor/CircleColor'
import CircleColor from '../../../components/Ui/CircleColor/CircleColor'

export const colors: Array<Color> = [
  {
    label: 'Blue',
    hexValue: '#3b88fd',
    name: 'PRIMARY',
  },
  {
    label: 'Green',
    hexValue: '#3ad116',
    name: 'DEFAULT',
  },
  {
    label: 'Orange',
    hexValue: '#f4b721',
    name: 'DANGER',
  },
  {
    label: 'Black with a long name to test padding lol',
    hexValue: '#000',
    name: 'SUCCESS',
  },
]
storiesOf('Core/Form/CircleColor', module).add('CircleColor', () => {
  const editable = boolean('editable', true)
  return <CircleColor editable={editable} onChange={() => {}} defaultColor={colors[0]} colors={colors} />
})
