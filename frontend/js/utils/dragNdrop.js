// @flow

export const reorder = (list: Array<Object>, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
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
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);

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
  source: Array<Object>,
  destination: Array<Object>,
  droppableSource: Object,
  destinationDroppableId: string,
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);

  const availableIndex = destClone.findIndex(item => item === null);

  const [removed] = sourceClone.splice(droppableSource.index, 1, null);
  destClone.splice(availableIndex, 1, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[destinationDroppableId] = destClone;

  return result;
};

export const formatDataDraggable = (index: number, droppableId: string) => ({
  index,
  droppableId,
});
