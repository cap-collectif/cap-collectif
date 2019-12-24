// @flow
import { type DraggableLocation } from 'react-beautiful-dnd';
import { type Field } from '~/components/Form/Ranking/Ranking';

export const reorder = (list: Array<Object>, startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const moveItem = (
  source: Array<Object>,
  destination: Array<Object>,
  droppableSource: Object,
  droppableDestination: Object,
  maxChoice?: number,
) => {
  const sourceClone = [...source];
  const destClone = [...destination];

  if (maxChoice && destination.length + 1 === source.length) {
    return;
  }

  if (destClone[droppableDestination.index] === null) {
    const [removed] = sourceClone.splice(droppableSource.index, 1, null);
    destClone.splice(droppableDestination.index, 1, removed);
  }

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

export const moveItemOnAvailable = (
  source: Array<Field>,
  destination: Array<Field>,
  droppableSource: DraggableLocation,
  destinationDroppableId: string,
) => {
  const sourceClone = [...source];
  const destClone = [...destination];

  const availableIndex = destClone.findIndex(item => item === null);

  const [removed] = sourceClone.splice(droppableSource.index, 1, null);
  destClone.splice(availableIndex, 1, removed);

  return {
    [droppableSource.droppableId]: sourceClone,
    [destinationDroppableId]: destClone,
  };
};

export const formatDataDraggable = (index: number | string, droppableId: string) => ({
  index,
  droppableId,
});
