import React from 'react'
import { useIntl } from 'react-intl'
import {
  Button,
  FormLabel,
  Heading,
  MultiStepModal,
  Text,
  useMultiStepModal,
  Box,
  Accordion,
  CapUIAccordionColor,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { FormValues } from '@components/Steps/ConsultationStep/ConsultationStepForm'
import { OpinionTypeInput } from '@relay/CreateOrUpdateConsultationMutation.graphql'

type Props = {
  sectionFormKey: `consultations.${number}.sections.${number}`
  onSuccess: (updatedSection: OpinionTypeInput) => void
}

const SectionAdditionalSettingsModal: React.FC<Props> = ({ sectionFormKey, onSuccess }) => {
  const intl = useIntl()
  const { goToPreviousStep } = useMultiStepModal()
  const { control, watch } = useFormContext<FormValues>()
  const { hide } = useMultiStepModal()

  const defaultOrderOptions = [
    {
      value: 'positions',
      label: intl.formatMessage({ id: 'opinion.sort.positions' }),
    },
    {
      value: 'random',
      label: intl.formatMessage({ id: 'global.random' }),
    },
    {
      value: 'last',
      label: intl.formatMessage({ id: 'opinion.sort.last' }),
    },
    {
      value: 'old',
      label: intl.formatMessage({ id: 'opinion.sort.old' }),
    },
    {
      value: 'favorable',
      label: intl.formatMessage({ id: 'opinion.sort.favorable' }),
    },
    {
      value: 'votes',
      label: intl.formatMessage({ id: 'opinion.sort.votes' }),
    },
    {
      value: 'comments',
      label: intl.formatMessage({ id: 'opinion.sort.comments' }),
    },
  ]
  const section = watch(sectionFormKey)

  return (
    <>
      <MultiStepModal.Header>
        <Text uppercase color="gray.500" fontWeight={700} fontSize={CapUIFontSize.Caption}>
          {intl.formatMessage({ id: 'project.types.consultation' })}
        </Text>
        <Heading color="primary.blue.900" fontSize={CapUIFontSize.DisplayMedium} fontWeight={600}>
          {intl.formatMessage({ id: 'additional-parameters' })}
        </Heading>
      </MultiStepModal.Header>
      <MultiStepModal.Body>
        <>
          <Box>
            <Text fontWeight={400} color="gray.900" fontSize={CapUIFontSize.BodySmall} mb={1}>
              {intl.formatMessage({ id: 'global.options' })}
            </Text>
            <FormControl mb={1} name={`${sectionFormKey}.contribuable`} control={control}>
              <FieldInput
                id={`${sectionFormKey}.contribuable`}
                name={`${sectionFormKey}.contribuable`}
                control={control}
                type="checkbox"
              >
                {intl.formatMessage({ id: 'admin.fields.opinion_type.is_enabled' })}
              </FieldInput>
            </FormControl>
            <FormControl mb={1} name={`${sectionFormKey}.versionable`} control={control}>
              <FieldInput
                id={`${sectionFormKey}.versionable`}
                name={`${sectionFormKey}.versionable`}
                control={control}
                type="checkbox"
              >
                {intl.formatMessage({
                  id: 'admin.fields.opinion_type.versionable',
                })}
              </FieldInput>
            </FormControl>
            <FormControl mb={1} name={`${sectionFormKey}.sourceable`} control={control}>
              <FieldInput
                id={`${sectionFormKey}.sourceable`}
                name={`${sectionFormKey}.sourceable`}
                control={control}
                type="checkbox"
              >
                {intl.formatMessage({ id: 'admin.fields.opinion_type.sourceable' })}
              </FieldInput>
            </FormControl>
          </Box>
          <Accordion color={CapUIAccordionColor.Transparent}>
            <Accordion.Item id={intl.formatMessage({ id: 'optional-settings' })}>
              <Accordion.Button>{intl.formatMessage({ id: 'optional-settings' })}</Accordion.Button>
              <Accordion.Panel>
                <>
                  <FormControl name={`${sectionFormKey}.subtitle`} control={control} isRequired mb={6}>
                    <FormLabel
                      htmlFor={`${sectionFormKey}.subtitle`}
                      label={intl.formatMessage({
                        id: 'admin.fields.section.teaser',
                      })}
                    />
                    <FieldInput
                      id={`${sectionFormKey}.subtitle`}
                      name={`${sectionFormKey}.subtitle`}
                      control={control}
                      type="text"
                    />
                  </FormControl>
                  <FormControl name={`${sectionFormKey}.defaultOrderBy`} control={control} isRequired mb={6}>
                    <FormLabel
                      htmlFor={`${sectionFormKey}.defaultOrderBy`}
                      label={intl.formatMessage({
                        id: 'admin.fields.opinion_type.default_filter',
                      })}
                    />
                    <FieldInput
                      name={`${sectionFormKey}.defaultOrderBy`}
                      control={control}
                      options={defaultOrderOptions}
                      type="select"
                      defaultValue="positions"
                    />
                  </FormControl>
                  <FormControl name={`${sectionFormKey}.votesHelpText`} control={control} isRequired mb={6}>
                    <FormLabel
                      htmlFor={`${sectionFormKey}.votesHelpText`}
                      label={intl.formatMessage({
                        id: 'admin.fields.opinion_type.votes_help_text',
                      })}
                    />
                    <FieldInput name={`${sectionFormKey}.votesHelpText`} control={control} type="textarea" />
                  </FormControl>
                </>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </>
      </MultiStepModal.Body>

      <MultiStepModal.Footer>
        <Button variantSize="medium" variant="secondary" onClick={goToPreviousStep}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          id="confirm-edit-section"
          variantSize="medium"
          onClick={() => {
            hide()
            onSuccess(section)
          }}
        >
          {intl.formatMessage({ id: 'global.add' })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}
export default SectionAdditionalSettingsModal
