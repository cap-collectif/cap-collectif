// @flow
import React, { useState, useEffect } from 'react';
import { type DropResult } from 'react-beautiful-dnd';
import Context from '~/components/Ui/DragnDrop/Context/Context';
import List from '~/components/Ui/DragnDrop/List/List';
import Item from '~/components/Ui/DragnDrop/Item/Item';
import RankingLabel from '../RankingLabel/RankingLabel';
import RankingListContainer from './RankingList.style';
import { swap, moveItemOnAvailable, moveItem, formatDataDraggable } from '~/utils/dragNdrop';
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

type PreviewDraggable = {
  draggableSource: {
    draggableId: string,
    droppableId: string,
  },
  draggableIdDestination: string,
} | null;

type ListItems = {
  [$Values<typeof ID_LIST>]: Array<Field>,
};

const RankingList = (props: RankingListProps) => {
  const { dataForm, isDisabled, onChange } = props;

  const [previewDraggable, setPreviewDraggable] = useState<PreviewDraggable>(null);
  const [choices, setChoices] = useState<Array<Field>>(dataForm.choices || []);

  // fill of null to get empty draggable item
  const [selection, setSelection] = useState<Array<Field>>([
    ...Array(dataForm.choices.length).fill(null),
  ]);

  useEffect(() => {
    const clearSelection = selection.filter(Boolean);
    onChange(clearSelection);
  }, [selection, onChange]);

  const getList = (id: string) => (id === ID_LIST.CHOICES ? choices : selection);

  const onSwap = (source, combine) => {
    const items = swap(getList(source.droppableId), source.index, combine.draggableId);

    if (source.droppableId === ID_LIST.SELECTION) setSelection(items);
    if (source.droppableId === ID_LIST.CHOICES) setChoices(items);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, combine } = result;

    // dropped outside the list
    if (!destination && !combine) return;

    // same list
    if (combine && source.droppableId === combine.droppableId) {
      onSwap(source, combine);
    }

    if (combine && source.droppableId !== combine.droppableId) {
      const indexDestination = Number(combine.draggableId.match(/\d/g));
      const droppableIdDestination = combine.droppableId;

      const formatedDestination = formatDataDraggable(indexDestination, droppableIdDestination);

      const listUpdated: ListItems = moveItem(
        getList(source.droppableId),
        getList(droppableIdDestination),
        source,
        formatedDestination,
        dataForm.choices.length,
      );

      setChoices(listUpdated[ID_LIST.CHOICES]);
      setSelection(listUpdated[ID_LIST.SELECTION]);
    }

    setPreviewDraggable(null);
  };

  const moveWithoutDrag = (
    currentIndex,
    from: $Values<typeof ID_LIST>,
    to: $Values<typeof ID_LIST>,
  ) => {
    const source = formatDataDraggable(currentIndex, from);

    const listUpdated: ListItems = moveItemOnAvailable(getList(from), getList(to), source, to);

    setChoices(listUpdated[ID_LIST.CHOICES]);
    setSelection(listUpdated[ID_LIST.SELECTION]);
    setPreviewDraggable(null);
  };

  const onDragUpdate = (result: DropResult) => {
    const { combine, draggableId, source } = result;

    if (!combine) setPreviewDraggable(null);

    if (combine) {
      if (!previewDraggable || previewDraggable.draggableIdDestination !== combine.draggableId) {
        setPreviewDraggable({
          draggableSource: {
            draggableId,
            droppableId: source.droppableId,
          },
          draggableIdDestination: combine.draggableId,
        });
      }
    }
  };

  const dataPreview = previewDraggable
    ? getList(previewDraggable.draggableSource.droppableId).find(
        item => item && item.id === previewDraggable.draggableSource.draggableId,
      )
    : null;

  return (
    <RankingListContainer>
      <Context isDisabled={isDisabled} onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
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
                  {...choice}
                  onPick={() => moveWithoutDrag(i, ID_LIST.CHOICES, ID_LIST.SELECTION)}
                />
              </Item>
            ) : (
              <Item
                id={`${ID_LIST.CHOICES}-${i}`}
                position={i}
                preview={
                  previewDraggable &&
                  dataPreview &&
                  previewDraggable.draggableIdDestination === `${ID_LIST.CHOICES}-${i}` && (
                    <RankingLabel {...dataPreview} />
                  )
                }
              />
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
                onRemove={() => moveWithoutDrag(j, ID_LIST.SELECTION, ID_LIST.CHOICES)}>
                <RankingLabel {...item} isSelected />
              </Item>
            ) : (
              <Item
                id={`${ID_LIST.SELECTION}-${j}`}
                position={j}
                preview={
                  previewDraggable &&
                  dataPreview &&
                  previewDraggable.draggableIdDestination === `${ID_LIST.SELECTION}-${j}` && (
                    <RankingLabel {...dataPreview} />
                  )
                }
              />
            ),
          )}
        </List>
      </Context>
    </RankingListContainer>
  );
};
export default RankingList;
