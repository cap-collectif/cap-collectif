import React, { useState } from 'react'
import styled from 'styled-components'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import type { ProposalStepStatusColor } from '~relay/UpdateProjectAlphaMutation.graphql'

export type Color = {
  name: ProposalStepStatusColor
  hexValue: string
  label: string
}
type Props = {
  editable: boolean
  onChange: (arg0: Color) => void
  colors: Array<Color>
  defaultColor: Color
}
const Container = styled(NavDropdown)<{
  disabled: boolean
}>`
  list-style: none;
  margin-right: 5px;

  a {
    display: flex;
    align-items: center;
  }

  .caret {
    color: #000;
  }
`
const Circle = styled.div<{
  color: string
  selected?: boolean
}>`
  background: ${props => props.color};
  width: ${props => (props.selected ? '16px' : '18px')};
  height: ${props => (props.selected ? '16px' : '18px')};
  border-radius: 10px;
  border: ${props => props.selected && '1px solid #fff'};
  box-shadow: ${props => props.selected && `0 0 0pt 2pt ${props.color}`};
  margin-right: ${props => props.selected && '2px'};
  margin-left: ${props => props.selected && '1px'};
`
const CircleListItem = styled(MenuItem)<{
  selected: boolean
  color: string
}>`
  a {
    display: flex !important;
    padding: 3px 10px !important;

    span {
      margin-left: 7px;
      font-weight: ${props => props.selected && 600};
      color: ${props => (props.selected ? props.color : '#333')};
    }
  }
`

const CircleColor = ({ editable, onChange, colors, defaultColor }: Props) => {
  const [currentColor, changeCurrentColor] = useState(defaultColor)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Container
      id="circle-color-dropdown"
      disabled={!editable}
      noCaret={!editable}
      onClick={() => setIsOpen(!isOpen)}
      open={isOpen}
      title={<Circle color={currentColor.hexValue} />}
    >
      {colors.map(color => (
        <CircleListItem
          key={color.hexValue}
          selected={color === currentColor}
          color={color.hexValue}
          onClick={() => {
            changeCurrentColor(color)
            setIsOpen(false)
            onChange(color)
          }}
        >
          <Circle color={color.hexValue} selected={color === currentColor} />
          <FormattedMessage id={color.label} />
        </CircleListItem>
      ))}
    </Container>
  )
}

export default CircleColor
