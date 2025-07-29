import { FC } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CarrouselEmptyList from './CarrouselEmptyList'
import { Box, DragnDrop } from '@cap-collectif/ui'
import { CarrouselAddItemButton } from './CarrouselAddItemButton'
import CarrouselItem from './CarrouselItem'
import { FormValues, SectionType } from './Carrousel.utils'
import { useIntl } from 'react-intl'

export const CarrouselContent: FC<{ onDelete: (id: string) => void; title?: string; type: SectionType }> = ({
  onDelete,
  title,
  type,
}) => {
  const { watch, control } = useFormContext<FormValues>()
  const intl = useIntl()

  const { fields, move, prepend } = useFieldArray<FormValues, 'carrouselElements'>({
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

  if (!controlledFields.length)
    return (
      <CarrouselEmptyList
        prepend={prepend}
        title={title ? `"${title}"` : intl.formatMessage({ id: 'global.carrousel' })}
        type={type}
      />
    )

  return (
    <Box>
      <CarrouselAddItemButton prepend={prepend} cannotAddMoreFields={controlledFields.length >= 8} type={type} />
      {controlledFields.length ? (
        // @ts-ignore
        <DragnDrop onDragEnd={onDragEnd} backgroundColor="red">
          <DragnDrop.List droppableId="carrouselElements">
            {controlledFields.map((element, index) => (
              // @ts-expect-error MAJ DS Props
              <DragnDrop.Item draggableId={element.id} index={index} key={element.id}>
                <CarrouselItem
                  fieldBaseName={`carrouselElements.${index}`}
                  onDelete={() => onDelete(element.id)}
                  type={type}
                />
              </DragnDrop.Item>
            ))}
          </DragnDrop.List>
        </DragnDrop>
      ) : null}
    </Box>
  )

  return
}

export default CarrouselContent
