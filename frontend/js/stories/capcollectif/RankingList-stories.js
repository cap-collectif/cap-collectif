// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { storiesOf } from '@storybook/react';
import GroupList from '~/components/Ui/DragnDrop/GroupList/GroupList';
import List from '~/components/Ui/DragnDrop/List/List';
import Item from '~/components/Ui/DragnDrop/Item/Item';
import Label from '~/components/Ui/DragnDrop/Label/Label';

const fruits = {
  available: ['Pomme', 'Poire', 'Framboise', 'Fraise', 'Kaki'],
};

const RankingListContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'rankingList',
})`
  .separator {
    align-self: center;
    font-size: 35px;
    color: #ddd;
  }
`;

const RankingList = () => (
  <RankingListContainer>
    <GroupList onDragEnd={() => {}}>
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
          <Item id={`choice-fruit-${i}`} position={i} isEmpty hasPositionDisplayed />
        ))}
      </List>
    </GroupList>
  </RankingListContainer>
);

storiesOf('Cap Collectif|RankingList', module).add('default', () => {
  return <RankingList />;
});
