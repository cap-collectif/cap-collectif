import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'
import OptionalMention from '../OptionalMention'

type Props = {
  control: Control<FormValues>
  summaryHelpText: string | null
}

const SUMMARY_MAX_LENGTH = 140

const SummaryInput: React.FC<Props> = ({ control, summaryHelpText }) => {
  const intl = useIntl()
  const summary = useWatch({ control, name: 'summary' }) ?? ''
  const isAtMaxLength = summary.length >= SUMMARY_MAX_LENGTH

  return (
    <FormControl errorId="global.summary-error" name="summary" control={control}>
      <FormLabel
        id="label-global.summary"
        htmlFor="global.summary"
        label={intl.formatMessage({ id: 'global.summary' })}
      >
        <OptionalMention />
      </FormLabel>
      <FieldInput
        type="textarea"
        control={control}
        name="summary"
        id="global.summary"
        maxLength={SUMMARY_MAX_LENGTH}
        // The visual counter (x/140) is not linked to the field: describe the limit and the help text
        aria-describedby={['global.summary-limit', summaryHelpText ? 'global.summary-help' : null]
          .filter(Boolean)
          .join(' ')}
      />
      <span id="global.summary-limit" className="sr-only">
        {intl.formatMessage({ id: 'characters-maximum' }, { quantity: SUMMARY_MAX_LENGTH })}
      </span>
      {/* maxlength silently stops the typing: announce it, only when the limit is reached */}
      <p role="status" className="sr-only">
        {isAtMaxLength ? intl.formatMessage({ id: 'invitations.custom-message.maximum-length' }) : ''}
      </p>
      {summaryHelpText && (
        <Text id="global.summary-help" color="text.tertiary" fontSize="sm" mt={1}>
          {summaryHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default SummaryInput
