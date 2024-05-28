import { Box, Flex, FormLabel, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

export type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'

type StepDurationProps = {
  canChooseDurationType?: boolean,
  startAt?: {
    required: boolean
  },
  endAt?: {
    required: boolean
  }
}

export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
  CUSTOM: 'CUSTOM',
  TIMELESS: 'TIMELESS',
} as const

const StepDurationInput: React.FC<StepDurationProps> = ({ canChooseDurationType = true, startAt = {required: true}, endAt = {required: false} }) => {
  const intl = useIntl()
  const { control, watch } = useFormContext()

  const stepDurationType = watch('stepDurationType')
  const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM

  return (
    <>
      {canChooseDurationType && (
        <FormControl name="stepDurationType" control={control} mt={6} mb={6}>
          <FormLabel htmlFor="stepDurationType" label={intl.formatMessage({ id: 'step-duration' })} />
          <FieldInput
            id="stepDurationType"
            name="stepDurationType"
            control={control}
            type="radio"
            choices={[
              {
                id: StepDurationTypeEnum.TIMELESS,
                label: intl.formatMessage({ id: 'timeless' }),
                useIdAsValue: true,
              },
              {
                id: StepDurationTypeEnum.CUSTOM,
                label: intl.formatMessage({ id: 'global.custom.feminine' }),
                useIdAsValue: true,
              },
            ]}
          />
        </FormControl>
      )}
      {(isCustomStepDuration || !canChooseDurationType) && (
        <Box color="gray.900" mt={6}>
          <Flex>
            <FormControl name="startAt" control={control} width="max-content" mr={6} isRequired={startAt.required}>
              <FormLabel htmlFor="startAt" label={intl.formatMessage({ id: 'start-date' })}>
                {
                  !startAt.required && (
                    <Text fontSize={2} color="gray.500" lineHeight="16px">
                      {intl.formatMessage({ id: 'global.optional' })}
                    </Text>
                  )
                }
              </FormLabel>
              <FieldInput id="startAt" name="startAt" control={control} type="dateHour" />
            </FormControl>
            <FormControl name="endAt" control={control} width="max-content" isRequired={endAt.required}>
              <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
                {
                  !endAt.required && (
                    <Text fontSize={2} color="gray.500" lineHeight="16px">
                      {intl.formatMessage({ id: 'global.optional' })}
                    </Text>
                  )
                }
              </FormLabel>
              <FieldInput id="endAt" name="endAt" control={control} type="dateHour" />
            </FormControl>
          </Flex>
        </Box>
      )}
    </>
  )
}

export default StepDurationInput
