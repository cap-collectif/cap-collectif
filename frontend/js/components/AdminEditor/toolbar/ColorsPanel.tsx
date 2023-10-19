// @ts-nocheck
import type { ComponentType } from 'react'
import React from 'react'
import styled, { css } from 'styled-components'

const COLORS = [
  {
    label: 'pink',
    value: '#ffc0cb',
  },
  {
    label: 'red',
    value: '#f00000',
  },
  {
    label: 'orange',
    value: '#ffa500',
  },
  {
    label: 'yellow',
    value: '#ffff00',
  },
  {
    label: 'limegreen',
    value: '#adff2f',
  },
  {
    label: 'green',
    value: '#008000',
  },
  {
    label: 'blue',
    value: '#0000ff',
  },
  {
    label: 'deepskyblue',
    value: '#00bfff',
  },
  {
    label: 'cyan',
    value: '#00ffff',
  },
  {
    label: 'indigo',
    value: '#4b0082',
  },
  {
    label: 'darkviolet',
    value: '#9400d3',
  },
  {
    label: 'lightgrey',
    value: '#d3d3d3',
  },
  {
    label: 'grey',
    value: '#808080',
  },
  {
    label: 'white',
    value: '#ffffff',
  },
  {
    label: 'black',
    value: '#000000',
  },
]
type ColorGridProps = {}
const ColorGrid: ComponentType<ColorGridProps> = styled('div')`
  width: 160px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px 0;

  & > * {
    margin: 4px;
  }
`
const checkedStyle = css`
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="%23FFF" /></svg>');
  background-position: center;
  background-repeat: no-repeat;
`
type ColorProps = {
  color: string | null | undefined
  checked: boolean
}
const Color: ComponentType<ColorProps> = styled('div')`
  background-color: ${({ color }) => color};
  ${({ checked }) => checked && checkedStyle}
  border-radius: 50%;
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`
type ColorsPanelProps = {
  onColorClick: (color: string) => void
  currentColor: string | null | undefined
}

function ColorsPanel({ onColorClick, currentColor }: ColorsPanelProps) {
  return (
    <ColorGrid>
      {COLORS.map(color => (
        <Color
          checked={color.value === currentColor}
          color={color.value}
          onClick={() => {
            onColorClick(color.value)
          }}
          key={color.value}
          aria-label={color.label}
        />
      ))}
    </ColorGrid>
  )
}

export default ColorsPanel
