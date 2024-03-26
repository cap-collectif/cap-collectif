// @ts-nocheck
import * as React from 'react'

import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import Context from '~/components/Ui/DragnDrop/Context/Context'
import List from '~/components/Ui/DragnDrop/List/List'
import Item from '~/components/Ui/DragnDrop/Item/Item'
import Label from '~/components/Ui/DragnDrop/Label/Label'

const fruits = {
  available: ['Pomme', 'Poire', 'Framboise', 'Fraise', 'Kaki'],
}
const RankingListContainer = styled.div.attrs({
  className: 'rankingList',
})`
  .separator {
    align-self: center;
    font-size: 35px;
    color: #ddd;
  }
`

const RankingList = () => (
  <RankingListContainer>
    <Context onDragEnd={() => {}}>
      <List id="available-fruits" title="Choix disponibles">
        {fruits.available.map((fruit, i) => (
          <Item id={`available-fruit-${i}`} position={i}>
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>

      <i className="separator cap-arrow-2" aria-hidden />

      <List id="choices-fruits" title="Votre classement" hasPositionDisplayed>
        {fruits.available.map((f, i) => (
          <Item id={`choice-fruit-${i}`} position={i} isEmpty />
        ))}
      </List>
    </Context>
  </RankingListContainer>
)

const RankingListWithChoices = () => (
  <RankingListContainer>
    <Context onDragEnd={() => {}}>
      <List id="available-fruits" title="Choix disponibles">
        {fruits.available.map((fruit, i) => (
          <Item id={`available-fruit-${i}`} position={i}>
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>

      <i className="separator cap-arrow-2" aria-hidden />

      <List id="choices-fruits" title="Votre classement" hasPositionDisplayed>
        <Item id="choice-fruit-1" position={0} onRemove={() => {}}>
          <Label>Ananas</Label>
        </Item>
        <Item id="choice-fruit-2" position={1} onRemove={() => {}}>
          <Label>Abricot</Label>
        </Item>
        <Item id="choice-fruit-3" position={2} />
        <Item id="choice-fruit-4" position={3} />
        <Item id="choice-fruit-5" position={4} />
      </List>
    </Context>
  </RankingListContainer>
)

storiesOf('Cap Collectif/RankingList', module).add('default', () => {
  return <RankingList />
})
storiesOf('Cap Collectif/RankingList', module).add('with choices', () => {
  return <RankingListWithChoices />
})
