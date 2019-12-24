// @flow
import React, { useState, useEffect } from 'react';
import { type DropResult } from 'react-beautiful-dnd';
import Context from '~/components/Ui/DragnDrop/Context/Context';
import List from '~/components/Ui/DragnDrop/List/List';
import Item from '~/components/Ui/DragnDrop/Item/Item';
import RankingLabel from '../RankingLabel/RankingLabel';
import RankingListContainer from './RankingList.style';
import { reorder, moveItemOnAvailable, moveItem, formatDataDraggable } from '~/utils/dragNdrop';
import config from '~/config';
import { type FieldsProps, type Field } from '../Ranking';

const ID_LIST: {
  CHOICES: 'ranking__choices',
  SELECTION: 'ranking__selection',
} = {
  CHOICES: 'ranking__choices',
  SELECTION: 'ranking__selection',
};

type RankingListProps = {
  onChange: (Array<Field>) => void,
  dataForm: FieldsProps,
  isDisabled?: boolean,
};

const RankingList = (props: RankingListProps) => {
  const { dataForm, isDisabled, onChange } = props;
  const [choices, setChoices] = useState<Array<Field>>(dataForm.choices || []);
  const [selection, setSelection] = useState<Array<Field>>([
    ...Array(dataForm.choices.length).fill(null),
  ]);

  useEffect(() => {
    const clearSelection = selection.filter(Boolean);
    onChange(clearSelection);
  }, [selection, onChange]);

  const getList = (id: string) => (id === ID_LIST.CHOICES ? choices : selection);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, combine } = result;

    // dropped outside the list
    if (!destination && !combine) return;

    // same list
    if (destination && source.droppableId === destination.droppableId) {
      const items = reorder(getList(source.droppableId), source.index, destination.index);

      if (source.droppableId === ID_LIST.SELECTION) {
        setSelection(items);
      } else {
        setChoices(items);
      }
    } else {
      const indexDestination = combine.draggableId.match(/\d+/)[0];
      const droppableIdDestination = combine.droppableId;

      const formatedDestination = formatDataDraggable(indexDestination, droppableIdDestination);

      const listUpdated = moveItem(
        getList(source.droppableId),
        getList(droppableIdDestination),
        source,
        formatedDestination,
        dataForm.choices.length,
      );

      setChoices(listUpdated[ID_LIST.CHOICES]);
      setSelection(listUpdated[ID_LIST.SELECTION]);
    }
  };

  const move = (currentIndex, from: $Values<typeof ID_LIST>, to: $Values<typeof ID_LIST>) => {
    const source = formatDataDraggable(currentIndex, from);

    const listUpdated = moveItemOnAvailable(getList(from), getList(to), source, to);

    setChoices(listUpdated[ID_LIST.CHOICES]);
    setSelection(listUpdated[ID_LIST.SELECTION]);
  };

  return (
    <RankingListContainer>
      <Context isDisabled={isDisabled} onDragEnd={onDragEnd}>
        <List
          id={ID_LIST.CHOICES}
          title="global.form.ranking.pickBox.title"
          isDisabled={isDisabled}
          isCombineEnabled
          isCombineOnly>
          {choices.map((choice, i) =>
            choice && choice.id ? (
              <Item id={choice.id} position={i} isDisabled={isDisabled}>
                <RankingLabel
                  label={choice.label}
                  description={choice.description}
                  image={choice.image}
                  onPick={() => move(i, ID_LIST.CHOICES, ID_LIST.SELECTION)}
                />
              </Item>
            ) : (
              <Item id={`${ID_LIST.CHOICES}-${i}`} position={i} key={`${ID_LIST.CHOICES}-${i}`} />
            ),
          )}
        </List>

        {!config.isMobile && <i className="separator cap-arrow-2" aria-hidden />}

        <List
          id={ID_LIST.SELECTION}
          title="global.form.ranking.choiceBox.title"
          isDisabled={isDisabled}
          isCombineEnabled
          isCombineOnly
          hasPositionDisplayed>
          {selection.map((item, j) =>
            item && item.id ? (
              <Item
                id={item.id}
                position={j}
                isDisabled={isDisabled}
                onRemove={() => move(j, ID_LIST.SELECTION, ID_LIST.CHOICES)}>
                <RankingLabel
                  label={item.label}
                  description={item.description}
                  image={item.image}
                  isSelected
                />
              </Item>
            ) : (
              <Item
                id={`${ID_LIST.SELECTION}-${j}`}
                position={j}
                key={`${ID_LIST.SELECTION}-${j}`}
              />
            ),
          )}
        </List>
      </Context>
    </RankingListContainer>
  );
};
export default RankingList;
