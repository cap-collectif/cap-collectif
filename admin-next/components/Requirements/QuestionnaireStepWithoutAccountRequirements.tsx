import React from 'react'
import { CapUIFontSize, CapUILineHeight, Flex, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { FieldInput } from '@cap-collectif/form'

const QuestionnaireStepWithoutAccountRequirements: React.FC = () => {
  const intl = useIntl()
  const { control } = useFormContext()
  return (
    <>
      <Text color="gray.900" mb={4}>
        {intl.formatMessage({ id: 'additional-options' })}
      </Text>
      <Flex bg="white" p={4} borderRadius="4px" direction="column">
        <Flex justifyContent="space-between">
          <Text as="label" fontWeight={600} width="100%" color="blue.900" lineHeight="normal">
            {intl.formatMessage({ id: 'collect-particpants-email' })}
          </Text>
          <FieldInput id="collectParticipantsEmail" type="switch" name="collectParticipantsEmail" control={control} />
        </Flex>
        <Text mt={1} fontSize={CapUIFontSize.BodySmall} lineHeight={CapUILineHeight.S} color="gray.700">
          {intl.formatMessage({ id: 'collect-particpants-email-help' })}
        </Text>
      </Flex>
    </>
  )
}

export default QuestionnaireStepWithoutAccountRequirements
