import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Props = {
  control: Control<FormValues>
  summaryHelpText: string | null
}

const SummaryInput: React.FC<Props> = ({ control, summaryHelpText }) => {
  const intl = useIntl()

  return (
    <FormControl name="summary" control={control}>
      <FormLabel htmlFor="summary" label={intl.formatMessage({ id: 'global.summary' })} />
      <FieldInput type="textarea" control={control} name="summary" id="summary" maxLength={140} />
      {summaryHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {summaryHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default SummaryInput
