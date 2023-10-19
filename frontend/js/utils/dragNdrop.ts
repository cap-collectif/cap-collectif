import type { DraggableLocation } from 'react-beautiful-dnd'
import 'react-beautiful-dnd'
import type { Field } from '~/components/Form/Form.type'
import '~/components/Form/Form.type'

export const reorder = (list: Array<Record<string, any>>, startIndex: number, endIndex: number) => {
  const result = [...list]
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}
export const swap = (list: Array<Record<string, any>>, startIndex: number, draggableIdDestination: number) => {
  const result = [...list]
  const destination = result[draggableIdDestination]
  result[draggableIdDestination] = result[startIndex]
  result[startIndex] = destination
  return result
}
export const moveItem = (
  source: Array<Record<string, any>>,
  destination: Array<Record<string, any>>,
  droppableSource: Record<string, any>,
  droppableDestination: Record<string, any>,
  maxChoice?: number,
) => {
  const sourceClone = [...source]
  const destClone = [...destination]

  if (maxChoice && destination.length + 1 === source.length) {
    return {
      [droppableSource.droppableId]: source,
      [droppableDestination.droppableId]: destination,
    }
  }

  // drag in empty cell
  if (destClone[droppableDestination.index] === null) {
    const [removed] = sourceClone.splice(droppableSource.index, 1, null)
    destClone.splice(droppableDestination.index, 1, removed)
  } else {
    const draggableDestination = destClone[droppableDestination.index]
    destClone[droppableDestination.index] = sourceClone[droppableSource.index]
    sourceClone[droppableSource.index] = draggableDestination
  }

  return {
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone,
  }
}
export const moveItemOnAvailable = (
  source: Array<Field>,
  destination: Array<Field>,
  droppableSource: DraggableLocation,
  destinationDroppableId: string,
) => {
  const sourceClone = [...source]
  const destClone = [...destination]
  const availableIndex = destClone.findIndex(item => item === null)
  const [removed] = sourceClone.splice(droppableSource.index, 1, null)
  destClone.splice(availableIndex, 1, removed)
  return {
    [droppableSource.droppableId]: sourceClone,
    [destinationDroppableId]: destClone,
  }
}
export const formatDataDraggable = (index: number, droppableId: string) => ({
  index,
  droppableId,
})
