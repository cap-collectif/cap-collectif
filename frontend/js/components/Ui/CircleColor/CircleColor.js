// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { NavDropdown, MenuItem } from 'react-bootstrap';

export type Color = {|
  name: string,
  hexValue: string,
|};

type Props = {|
  editable: boolean,
  onChange: Color => void,
  colors: Array<Color>,
  defaultColor: Color,
|};

const Container: StyledComponent<{ disabled: boolean }, {}, NavDropdown> = styled(NavDropdown)`
  list-style: none;
  margin-right: 5px;
  a {
    display: flex;
    align-items: center;
  }
  .caret {
    color: #000;
  }
`;

const Circle: StyledComponent<
  { color: string, selected?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  background: ${props => props.color};
  width: ${props => (props.selected ? '16px' : '18px')};
  height: ${props => (props.selected ? '16px' : '18px')};
  border-radius: 10px;
  border: ${props => props.selected && '1px solid #fff'};
  box-shadow: ${props => props.selected && `0 0 0pt 2pt ${props.color}`};
  margin-right: ${props => props.selected && '2px'};
  margin-left: ${props => props.selected && '1px'};
`;

const CircleListItem: StyledComponent<{ selected: boolean, color: string }, {}, MenuItem> = styled(
  MenuItem,
)`
  a {
    display: flex !important;
    padding: 3px 10px !important;
    span {
      margin-left: 7px;
      font-weight: ${props => props.selected && 600};
      color: ${props => (props.selected ? props.color : '#333')};
    }
  }
`;

const CircleColor = ({ editable, onChange, colors, defaultColor }: Props) => {
  const [currentColor, changeCurrentColor] = useState(defaultColor);
  return (
    <Container
      id="circle-color-dropdown"
      disabled={!editable}
      noCaret={!editable}
      title={<Circle color={currentColor.hexValue} />}>
      {colors.map(color => (
        <CircleListItem
          selected={color === currentColor}
          color={color.hexValue}
          onClick={() => {
            changeCurrentColor(color);
            onChange(color);
          }}>
          <Circle color={color.hexValue} selected={color === currentColor} />
          <span>{color.name}</span>
        </CircleListItem>
      ))}
    </Container>
  );
};

export default CircleColor;
