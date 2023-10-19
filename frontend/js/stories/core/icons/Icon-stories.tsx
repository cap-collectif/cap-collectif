// @ts-nocheck
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import styled from 'styled-components'
import Icon, { ICON_NAME, ICON_NAME as ALL_ICONS } from '~/components/Ui/Icons/Icon'
import IconRounded from '~ui/Icons/IconRounded'

const Container = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`
const IconContainer = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 130px;
  width: 130px;
  padding: 10px;
  border: 1px solid #acacac;
  border-radius: 4px;
  margin: 10px;
  text-align: center;

  .name {
    margin-top: 20px;
  }
`
storiesOf('Core/Icons/Icon', module)
  .add('default', () => <Icon name="link" size={80} color="red" />)
  .add('rounded', () => (
    <IconRounded size={80} color="rgba(240, 0, 0, .7)">
      <Icon name={ICON_NAME.trash} size={50} color="#fff" />
    </IconRounded>
  ))
storiesOf('Core/Icons/Icon', module).add('All', () => {
  return (
    <Container>
      {Object.keys(ALL_ICONS).map(name => (
        <IconContainer>
          <Icon name={ALL_ICONS[name]} width="5rem" height="5rem" />
          <span className="name">{ALL_ICONS[name]}</span>
        </IconContainer>
      ))}
    </Container>
  )
})
