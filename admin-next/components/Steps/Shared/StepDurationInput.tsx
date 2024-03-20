import { Box, Flex, FormLabel, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

export type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'

export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
  CUSTOM: 'CUSTOM',
  TIMELESS: 'TIMELESS',
} as const

const StepDurationInput: React.FC = () => {
  const intl = useIntl()
  const { control, watch } = useFormContext()

  const stepDurationType = watch('stepDurationType')
  const isCustomStepDuration = stepDurationType?.labels?.[0] === StepDurationTypeEnum.CUSTOM

  return (
    <>
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
      {isCustomStepDuration && (
        <Box color="gray.900" mt={6}>
          <Flex>
            <FormControl name="startAt" control={control} width="max-content" mr={6}>
              <FormLabel htmlFor="startAt" label={intl.formatMessage({ id: 'start-date' })}>
                <Text fontSize={2} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput
                id="startAt"
                name="startAt"
                control={control}
                type="dateHour"
                // @ts-expect-error MAJ DS Props
                dateInputProps={{ isOutsideRange: true }}
              />
            </FormControl>
            <FormControl name="endAt" control={control} width="max-content">
              <FormLabel htmlFor="endAt" label={intl.formatMessage({ id: 'ending-date' })}>
                <Text fontSize={2} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput
                id="endAt"
                name="endAt"
                control={control}
                type="dateHour"
                // @ts-expect-error MAJ DS Props
                dateInputProps={{ isOutsideRange: true }}
              />
            </FormControl>
          </Flex>
        </Box>
      )}
    </>
  )
}

export default StepDurationInput
