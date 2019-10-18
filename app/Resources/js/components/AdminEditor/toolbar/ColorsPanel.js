// @flow
import React from 'react';
import styled, { css } from 'styled-components';

const COLOR = [
  {
    label: 'White',
    value: 'white',
  },
  {
    label: 'Red',
    value: 'red',
  },
  {
    label: 'Orange',
    value: 'orange',
  },
  {
    label: 'Yellow',
    value: 'yellow',
  },
  {
    label: 'Green',
    value: 'green',
  },
  {
    label: 'Blue',
    value: 'blue',
  },
  {
    label: 'Indigo',
    value: 'indigo',
  },
  {
    label: 'Violet',
    value: 'violet',
  },
  {
    label: 'Grey',
    value: 'grey',
  },
  {
    label: 'Black',
    value: 'black',
  },
];

const ColorGrid = styled.div`
  width: 160px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px 0;

  & > * {
    margin: 4px;
  }
`;

const checkedStyle = css`
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="%23FFF" /></svg>');
  background-position: center;
  background-repeat: no-repeat;
`;

const Color = styled.div`
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
`;

type Props = {
  onColorClick: Function,
  currentColor: Object,
};

function ColorsPanel({ onColorClick, currentColor }: Props) {
  return (
    <ColorGrid>
      {COLOR.map(color => (
        <Color
          checked={color.value === currentColor}
          color={color.value}
          onClick={() => {
            onColorClick(color.value);
          }}
          key={color.value}
          aria-label={color.label}
        />
      ))}
    </ColorGrid>
  );
}

export default ColorsPanel;
