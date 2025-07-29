import { FormLabel } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import DurationInput from '@components/BackOffice/Form/DurationInput'

export type StepTypeDurationTypeUnion = 'CUSTOM' | 'TIMELESS'

type StepDurationProps = {
  canChooseDurationType?: boolean
  startAt?: {
    required: boolean
  }
  endAt?: {
    required: boolean
  }
}

export const StepDurationTypeEnum: Record<StepTypeDurationTypeUnion, StepTypeDurationTypeUnion> = {
  CUSTOM: 'CUSTOM',
  TIMELESS: 'TIMELESS',
} as const

const StepDurationInput: React.FC<StepDurationProps> = ({
  canChooseDurationType = true,
  startAt = { required: true },
  endAt = { required: false },
}) => {
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
      {(isCustomStepDuration || !canChooseDurationType) && <DurationInput startAt={startAt} endAt={endAt} mt={6} />}
    </>
  )
}

export default StepDurationInput
