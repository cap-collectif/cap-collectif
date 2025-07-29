import React from 'react'
import ConsultationStepConsultationTab from '@components/BackOffice/Steps/ConsultationStep/ConsultationStepConsultationTab'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Accordion, Box, CapUIAccordionColor, CapUIFontSize, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { ConsultationStepConsultations_query$key } from '@relay/ConsultationStepConsultations_query.graphql'
import { FormValues, getDefaultSection } from '@components/BackOffice/Steps/ConsultationStep/ConsultationStepForm'
import { AnimatePresence, motion } from 'framer-motion'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type Props = {
  query: ConsultationStepConsultations_query$key
}

const QUERY_FRAGMENT = graphql`
  fragment ConsultationStepConsultations_query on Query {
    ...ConsultationStepConsultationTab_query
  }
`

const ConsultationStepConsultations: React.FC<Props> = ({ query: queryRef }) => {
  const intl = useIntl()
  const { control, formState } = useFormContext<FormValues>()
  const { errors } = formState
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const multiConsultations = useFeatureFlag('multi_consultations')

  const {
    fields: consultations,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'consultations',
    rules: { required: intl.formatMessage({ id: 'add-consultation-error' }) },
  })

  const appendConsultation = () => {
    const emptyConsultation = {
      id: `temp-${crypto.randomUUID()}`,
      title: '',
      description: '',
      sections: [getDefaultSection(intl)],
      illustration: null,
      model: null,
    }
    append(emptyConsultation)
  }

  return (
    <>
      <Accordion color={CapUIAccordionColor.Transparent} defaultAccordion={['consultations']}>
        <Accordion.Item id="consultations">
          <Accordion.Button>{intl.formatMessage({ id: 'consultations' })}</Accordion.Button>
          <Accordion.Panel>
            <Box id="consultations-list">
              {consultations.map((consultation, index) => {
                return (
                  <AnimatePresence key={index}>
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ConsultationStepConsultationTab
                        key={index}
                        consultationIndex={index}
                        removeConsultation={remove}
                        query={query}
                      />
                    </motion.div>
                  </AnimatePresence>
                )
              })}
            </Box>
            {errors.consultations?.root?.message && <Text color="red.500">{errors.consultations?.root?.message}</Text>}
            {multiConsultations && (
              <Box
                id="append-consultation-button"
                as="button"
                p={4}
                bg="gray.100"
                width="100%"
                color="blue.500"
                fontSize={CapUIFontSize.BodyRegular}
                fontWeight={600}
                type="button"
                onClick={appendConsultation}
              >
                {intl.formatMessage({ id: 'add-a-consultation' })}
              </Box>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  )
}

export default ConsultationStepConsultations
