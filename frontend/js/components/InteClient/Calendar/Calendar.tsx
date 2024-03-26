// @ts-nocheck
import React from 'react'

import styled from 'styled-components'

type Props = {
  activeColor?: string
  defaultColor: string
  backgroundColor: string
  inputs: Array<{
    title: string
    date: string
  }>
  activeNumber?: number
  withBorder?: boolean
}
const InputContent = styled.div<{
  color: string
  last: boolean
  branchColor: string
}>`
  position: relative;
  display: flex;
  font-size: 16px;
  :after {
    top: 50%;
    display: ${props => props.last && 'none !important'};
  }
  :after,
  :before {
    content: '';
    display: block;
    height: 100%;
    background: ${props => props.branchColor};
    width: 2px;
    position: absolute;
    left: 19px;
  }
  :before {
    display: ${props => props.last && 'none !important'};
  }
`
const Circle = styled.div`
  margin-right: 15px;
`
const CircleData: StyledComponent<
  {
    color: string
    active: boolean
    backgroundColor: string
    withBorder: boolean
  },
  {},
  HTMLDivElement
> = styled.div`
  height: 40px;
  width: 40px;
  margin: 0 auto 15px;
  border: ${props => (props.active ? '3px' : '2px')} solid ${props => props.color};
  border-radius: 50%;
  position: relative;
  z-index: 1;
  display: flex;
  background: ${props => props.backgroundColor};
  span {
    margin: auto;
  }

  color: ${props => props.color};
  font-weight: ${props => props.active && 'bold'};
  outline: ${props => (props.withBorder ? '5px' : '0px')} solid ${props => props.backgroundColor};
`
const Data = styled.div`
  margin-right: 15px;
`
const Title = styled.div<{
  color: string
}>`
  color: ${props => props.color};
  font-weight: bold;
`
export const Calendar = ({
  inputs,
  defaultColor,
  activeColor,
  activeNumber = 0,
  backgroundColor = '#FFF',
  withBorder = false,
}: Props) => {
  const active = activeColor !== null ? activeColor : defaultColor
  return (
    <div>
      {inputs?.length !== 0 &&
        inputs.map((input, idx) => (
          <div
            key={idx}
            style={{
              margin: '15px 0',
            }}
          >
            <InputContent
              key={idx}
              branchColor={defaultColor}
              color={idx === activeNumber - 1 ? active : defaultColor}
              last={idx === inputs.length - 1}
            >
              <Circle>
                <CircleData
                  withBorder={withBorder}
                  backgroundColor={backgroundColor}
                  color={idx === activeNumber - 1 ? active : defaultColor}
                  active={idx === activeNumber - 1}
                >
                  <span>{idx + 1}</span>
                </CircleData>
              </Circle>
              <Data>
                <Title color={idx === activeNumber - 1 ? active : defaultColor}>{input.title}</Title>
                <div>{input.date}</div>
              </Data>
            </InputContent>
          </div>
        ))}
    </div>
  )
}
export default Calendar
