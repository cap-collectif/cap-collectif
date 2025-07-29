import React from 'react'
import { ButtonQuickAction, CapUIFontSize, CapUIIcon, Flex, ListCard, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ConsultationSectionModal from '@components/BackOffice/Steps/ConsultationStep/ConsultationSectionModal'
import { useFormContext } from 'react-hook-form'
import { UseFieldArrayRemove } from 'react-hook-form/dist/types/fieldArray'

type Props = {
  depth: number
  index: number
  removeSection: UseFieldArrayRemove
  sectionsFormKey: string
  isParentSection: boolean
}

const SectionListItem: React.FC<Props> = ({ depth = 0, index, removeSection, sectionsFormKey, isParentSection }) => {
  const intl = useIntl()
  const { watch } = useFormContext()

  const isChildSection = depth > 0

  const sectionFormKey = `${sectionsFormKey}.${index}` as `consultations.${number}.sections.${number}`

  const getLabel = () => {
    if (isChildSection) {
      return intl.formatMessage({ id: 'global.question.types.sub-section' })
    }
    if (isParentSection) {
      return intl.formatMessage({ id: 'global.question.types.section' })
    }
    return intl.formatMessage({ id: 'participation-area' })
  }

  const offset = isChildSection ? 16 + depth * 8 : 16

  const section = watch(sectionFormKey)

  const showDeleteButton = index > 0 || isChildSection

  return (
    <ListCard.Item
      data-cy={`${sectionFormKey}-section-item`}
      className="section-item"
      bg="white"
      borderRadius="normal"
      border="1px"
      mb={1}
      mt={1}
      sx={{ '.cap-buttonGroup': { opacity: 0 } }}
      _hover={{ '.cap-buttonGroup': { opacity: 1 } }}
      draggable
      width="100%"
      pl={`${offset}px`}
    >
      <Flex direction="column">
        <Text color="gray.500" fontSize={CapUIFontSize.Caption} fontWeight={400} lineHeight="normal">
          {getLabel()}
        </Text>
        <Text
          data-cy={`${sectionFormKey}-section-title`}
          color="blue.900"
          fontSize={CapUIFontSize.BodySmall}
          fontWeight={600}
          lineHeight="normal"
        >
          {section?.title}
        </Text>
      </Flex>
      <Flex>
        <ConsultationSectionModal
          sectionFormKey={sectionFormKey}
          disclosure={
            <ButtonQuickAction
              tooltipZIndex={2}
              data-cy={`${sectionFormKey}-edit-button`}
              variantColor="primary"
              icon={CapUIIcon.Pencil}
              label={intl.formatMessage({
                id: 'global.edit',
              })}
              type="button"
            />
          }
        />
        {showDeleteButton && (
          <ButtonQuickAction
            tooltipZIndex={2}
            data-cy={`${sectionFormKey}-delete-button`}
            onClick={() => {
              removeSection(index)
            }}
            variantColor="danger"
            icon={CapUIIcon.Trash}
            label={intl.formatMessage({
              id: 'global.delete',
            })}
            type="button"
          />
        )}
      </Flex>
    </ListCard.Item>
  )
}

export default SectionListItem
