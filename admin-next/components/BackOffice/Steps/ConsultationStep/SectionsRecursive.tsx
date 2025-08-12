import React from 'react'
import { Box, DragnDrop } from '@cap-collectif/ui'
import { useFieldArray, useFormContext } from 'react-hook-form'
import SectionListItem from '@components/BackOffice/Steps/ConsultationStep/SectionListItem'
import { FormValues } from '@components/BackOffice/Steps/ConsultationStep/ConsultationStepForm'
import { DropResult } from 'react-beautiful-dnd'

type Props = {
  sectionsFormKey: string
  depth?: number
  index?: number
  onDragEnd?: (result: DropResult) => void
}

const SectionsRecursive: React.FC<Props> = ({ sectionsFormKey, depth = 0, index = 0, onDragEnd }) => {
  const { control, watch } = useFormContext<FormValues>()

  const formKey =
    depth === 0
      ? (`${sectionsFormKey}` as `consultations.${number}.sections`)
      : (`${sectionsFormKey}.${index}.sections` as `consultations.${number}.sections`)

  // when we select a new model it won't refresh the sections array, so we need to watch for it
  const sections = watch(formKey)

  const { remove: removeSection } = useFieldArray({
    control,
    name: formKey,
  })

  if ((sections?.length ?? 0) === 0) {
    return null
  }

  const hasAtLeastOneSubSections = sections.some(section => {
    return (section?.sections?.length ?? 0) > 0
  })

  // we only allow drag and drop if the consultations does not contain any subsections
  if (!hasAtLeastOneSubSections && onDragEnd) {
    return (
      <Box>
        <DragnDrop onDragEnd={onDragEnd}>
          <DragnDrop.List droppableId={formKey}>
            {sections.map((section, index) => {
              const hasSubSections = (section?.sections?.length ?? 0) > 0
              return (
                <DragnDrop.Item draggableId={section.id} index={index} key={section.id}>
                  <SectionListItem
                    sectionsFormKey={formKey}
                    depth={depth}
                    index={index}
                    removeSection={removeSection}
                    isParentSection={hasSubSections}
                  />
                </DragnDrop.Item>
              )
            })}
          </DragnDrop.List>
        </DragnDrop>
      </Box>
    )
  }

  return (
    <Box data-cy="sections-list">
      {sections.map((section, index) => {
        const hasSubSections = (section?.sections?.length ?? 0) > 0
        return (
          <>
            <SectionListItem
              sectionsFormKey={formKey}
              depth={depth}
              index={index}
              removeSection={removeSection}
              isParentSection={hasSubSections}
            />
            {hasSubSections && <SectionsRecursive sectionsFormKey={formKey} depth={depth + 1} index={index} />}
          </>
        )
      })}
    </Box>
  )
}

export default SectionsRecursive
