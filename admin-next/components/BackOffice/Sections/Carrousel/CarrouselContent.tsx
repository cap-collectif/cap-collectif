import { FC } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CarrouselEmptyList from './CarrouselEmptyList'
import { Box, DragnDrop } from '@cap-collectif/ui'
import { CarrouselAddItemButton } from './CarrouselAddItemButton'
import CarrouselItem from './CarrouselItem'
import { FormValues, SectionType } from './Carrousel.utils'

export const CarrouselContent: FC<{ title?: string; type: SectionType }> = ({ title, type }) => {
  const { watch, control } = useFormContext<FormValues>()

  const { fields, move, prepend, remove } = useFieldArray<FormValues, 'carrouselElements'>({
    control,
    name: 'carrouselElements',
  })
  const watchFieldArray = watch('carrouselElements')
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    }
  })

  const onDragEnd = (result: { destination: { index: number }; source: { index: number } }) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return
    }
    move(result.source.index, result.destination.index)
  }

  if (!controlledFields.length) return <CarrouselEmptyList prepend={prepend} title={title} type={type} />

  return (
    <Box>
      <CarrouselAddItemButton prepend={prepend} cannotAddMoreFields={controlledFields.length >= 8} type={type} />
      {controlledFields.length ? (
        // @ts-ignore
        <DragnDrop onDragEnd={onDragEnd} backgroundColor="red">
          <DragnDrop.List droppableId="carrouselElements">
            {controlledFields.map((element, index) => (
              <DragnDrop.Item draggableId={element.id} index={index} key={element.id}>
                <CarrouselItem fieldBaseName={`carrouselElements.${index}`} index={index} remove={remove} type={type} />
              </DragnDrop.Item>
            ))}
          </DragnDrop.List>
        </DragnDrop>
      ) : null}
    </Box>
  )
}

export default CarrouselContent
