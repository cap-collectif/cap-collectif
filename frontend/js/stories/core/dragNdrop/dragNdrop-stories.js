// @flow
import * as React from 'react';
import { text } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import Context from '../../../components/Ui/DragnDrop/Context/Context';
import List from '../../../components/Ui/DragnDrop/List/List';
import Item from '../../../components/Ui/DragnDrop/Item/Item';
import Label from '../../../components/Ui/DragnDrop/Label/Label';

const data = {
  listFruits: ['Pomme', 'Poire', 'Orange'],
  fruitsChoice: ['Cerise', 'Kaki', 'Banane'],
};

storiesOf('Core|DragnDrop', module).add('default', () => {
  const dataFruits = text('Content', data);

  return (
    <Context onDragEnd={() => {}}>
      <List id="listFruits">
        {dataFruits.listFruits.map((fruit, i) => (
          <Item id={`listFruits-${i}`} position={i} icon="cap-android-menu">
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>
    </Context>
  );
});

storiesOf('Core|DragnDrop', module).add('empty list', () => {
  const dataFruits = text('Content', data);
  const { listFruits } = dataFruits;

  return (
    <Context onDragEnd={() => {}}>
      <List id="fruitsChoice" isCombineEnabled>
        {listFruits.map((fruit, k) => (
          <Item id={`fruitsChoice-${k}`} position={k} isEmpty />
        ))}
      </List>
    </Context>
  );
});

storiesOf('Core|DragnDrop', module).add('list with position', () => {
  const dataFruits = text('Content', data);
  const { listFruits } = dataFruits;

  return (
    <Context onDragEnd={() => {}}>
      <List id="fruitsChoice" isCombineEnabled hasPositionDisplayed>
        {listFruits.map((fruit, k) => (
          <Item id={`fruitsChoice-${k}`} position={k} hasPositionDisplayed />
        ))}
      </List>
    </Context>
  );
});

storiesOf('Core|DragnDrop', module).add('list with title', () => {
  const dataFruits = text('Content', data);
  const { listFruits } = dataFruits;

  return (
    <Context onDragEnd={() => {}}>
      <List id="fruitsChoice" title="Choix disponibles" isCombineEnabled>
        {listFruits.map((fruit, i) => (
          <Item id={`listFruits-${i}`} position={i}>
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>
    </Context>
  );
});

storiesOf('Core|DragnDrop', module).add('multiple list', () => {
  const dataFruits = text('Content', data);
  const { listFruits, fruitsChoice } = dataFruits;

  return (
    <Context onDragEnd={() => {}}>
      <List id="listFruits">
        {listFruits.map((fruit, i) => (
          <Item id={`listFruits-${i}`} position={i}>
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>

      <List id="fruitsChoice">
        {fruitsChoice.map((fruit, k) => (
          <Item id={`fruitsChoice-${k}`} position={k}>
            <Label>{fruit}</Label>
          </Item>
        ))}
      </List>
    </Context>
  );
});
