import React from 'react'
import { Box, Button, CapUIFontSize, Flex, FormLabel, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { UPLOAD_PATH } from '@utils/config'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import SectionsRecursive from '@components/BackOffice/Steps/ConsultationStep/SectionsRecursive'
import { UseFieldArrayRemove } from 'react-hook-form/dist/types/fieldArray'
import { getDefaultSection } from '@components/BackOffice/Steps/ConsultationStep/ConsultationStepForm'
import { DropResult } from 'react-beautiful-dnd'

type Props = {
  consultationFormKey: string
  sectionsFormKey: string
  removeConsultation: UseFieldArrayRemove
  consultationIndex: number
}

const ConsultationForm: React.FC<Props> = ({
  consultationFormKey,
  sectionsFormKey,
  consultationIndex,
  removeConsultation,
}) => {
  const intl = useIntl()
  const { control, watch } = useFormContext()

  const hasMultipleConsultations = (watch(`consultations`)?.length ?? 0) > 1

  const { move, append } = useFieldArray({
    control,
    name: sectionsFormKey,
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return
    }
    move(result.source.index, result.destination.index)
  }

  const appendSection = () => {
    const section = getDefaultSection(intl)
    append(section)
  }

  return (
    <>
      {hasMultipleConsultations && (
        <Box ml={4} mb={4}>
          <Text mb={4}>{intl.formatMessage({ id: 'general-infos' })}</Text>
          <Flex bg="white" p={6} justifyContent="space-between" borderRadius="4px" alignItems="center" spacing={4}>
            <Flex width="100%" direction="column">
              <FormControl name={`${consultationFormKey}.title`} control={control} isRequired={true} mb={6}>
                <FormLabel
                  htmlFor={`${consultationFormKey}.title`}
                  label={intl.formatMessage({ id: 'global.title' })}
                />
                <FieldInput name={`${consultationFormKey}.title`} control={control} type="text" />
              </FormControl>
              <FormControl name={`${consultationFormKey}.description`} control={control} isRequired={false} mb={6}>
                <FormLabel
                  htmlFor={`${consultationFormKey}.description`}
                  label={intl.formatMessage({ id: 'global.description' })}
                />
                <FieldInput name={`${consultationFormKey}.description`} control={control} type="textarea" />
              </FormControl>
            </Flex>
            <Box>
              <FormControl name={`${consultationFormKey}.illustration`} control={control}>
                <FormLabel
                  label={intl.formatMessage({
                    id: 'project_download.label.media',
                  })}
                >
                  <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FieldInput
                  width="100%"
                  type="uploader"
                  name={`${consultationFormKey}.illustration`}
                  control={control}
                  format=".jpg,.jpeg,.png"
                  maxSize={2048000}
                  size={UPLOADER_SIZE.SM}
                  uploadURI={UPLOAD_PATH}
                  showThumbnail
                />
              </FormControl>
            </Box>
          </Flex>
        </Box>
      )}
      {
        <>
          <Text mb={2} ml={4}>
            {intl.formatMessage({ id: 'structure-and-plan' })}
          </Text>
          <SectionsRecursive sectionsFormKey={sectionsFormKey} onDragEnd={onDragEnd} />
          <Box mt={4} ml={4}>
            <Button
              data-cy={`${consultationFormKey}-append-section-button`}
              variantColor="primary"
              variant="secondary"
              variantSize="small"
              onClick={() => appendSection()}
            >
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          </Box>
          {hasMultipleConsultations && (
            <Box
              id="remove-consultion-button"
              as="button"
              type="button"
              p={4}
              bg="gray.100"
              width="100%"
              color="red.500"
              fontSize={CapUIFontSize.BodyRegular}
              fontWeight={600}
              onClick={() => {
                removeConsultation(consultationIndex)
              }}
            >
              {intl.formatMessage({ id: 'remove-a-consultation' })}
            </Box>
          )}
        </>
      }
    </>
  )
}

export default ConsultationForm
