// @flow
import React, { useState, useEffect } from 'react';
import { type DropResult, type DragUpdate } from 'react-beautiful-dnd';
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
    if (clearSelection.length > 0) onChange(clearSelection);
  }, [selection, onChange]);

  const getList = (id: string) => (id === ID_LIST.CHOICES ? choices : selection);

  const getDestinationIndex = (list, draggableIdDestination) => {
    let destinationIndex = list.findIndex(item => item && item.id === draggableIdDestination);

    // empty destination
    if (destinationIndex === -1) {
      destinationIndex = Number(draggableIdDestination.match(/\d/g));
    }

    return destinationIndex;
  };

  const onSwap = (source, combine) => {
    const { draggableId: draggableIdDestination } = combine;
    const currentList = getList(source.droppableId);
    const destinationIndex = getDestinationIndex(currentList, draggableIdDestination);

    const items = swap(currentList, source.index, destinationIndex);

    if (source.droppableId === ID_LIST.SELECTION) setSelection(items);
    if (source.droppableId === ID_LIST.CHOICES) setChoices(items);
  };

  const onDragInOtherList = (source, combine) => {
    const { draggableId: draggableIdDestination, droppableId: droppableIdDestination } = combine;
    const destinationList = getList(combine.droppableId);
    const destinationIndex = getDestinationIndex(destinationList, draggableIdDestination);
    const formatedDestination = formatDataDraggable(destinationIndex, droppableIdDestination);

    const listUpdated: ListItems = moveItem(
      getList(source.droppableId),
      getList(droppableIdDestination),
      source,
      formatedDestination,
      dataForm.choices.length,
    );

    setChoices(listUpdated[ID_LIST.CHOICES]);
    setSelection(listUpdated[ID_LIST.SELECTION]);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, combine } = result;

    // dropped outside the list
    if (!destination && !combine) return;

    // same list (interchange)
    if (combine && source.droppableId === combine.droppableId) {
      onSwap(source, combine);
    }

    // same list (reorder)
    if (destination && source.droppableId === destination.droppableId) {
      const currentList = getList(source.droppableId);
      const items = swap(currentList, source.index, destination.index);

      if (source.droppableId === ID_LIST.SELECTION) setSelection(items);
      if (source.droppableId === ID_LIST.CHOICES) setChoices(items);
    }

    // from list to another one
    if (combine && source.droppableId !== combine.droppableId) {
      onDragInOtherList(source, combine);
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

  const onDragUpdate = (result: DragUpdate) => {
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
              <Item id={choice.id} key={choice.id} position={i} isDisabled={isDisabled}>
                <RankingLabel
                  {...choice}
                  onPick={() => moveWithoutDrag(i, ID_LIST.CHOICES, ID_LIST.SELECTION)}
                />
              </Item>
            ) : (
              <Item
                id={`${ID_LIST.CHOICES}-${i}`}
                key={`${ID_LIST.CHOICES}-${i}`}
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
                key={item.id}
                position={j}
                isDisabled={isDisabled}
                onRemove={() => moveWithoutDrag(j, ID_LIST.SELECTION, ID_LIST.CHOICES)}>
                <RankingLabel {...item} isSelected />
              </Item>
            ) : (
              <Item
                id={`${ID_LIST.SELECTION}-${j}`}
                key={`${ID_LIST.SELECTION}-${j}`}
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
