import { FormControl } from '@cap-collectif/form'
import { Text } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Props = {
  control: Control<FormValues>
  descriptionMandatory: boolean
  descriptionHelpText: string | null
  defaultLocale: string
}

const ERROR_ID = 'proposal_body-error'

const DescriptionInput: React.FC<Props> = ({ control, descriptionMandatory, descriptionHelpText, defaultLocale }) => {
  const intl = useIntl()

  return (
    // FormControl renders the error message, TextEditor links it to the editable area
    <FormControl errorId={ERROR_ID} name="body" control={control} isRequired={descriptionMandatory}>
      <TextEditor
        label={intl.formatMessage({ id: 'proposal.body' })}
        name="body"
        id="proposal_body"
        labelId="label-proposal_body"
        placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
        required={descriptionMandatory}
        errorId={ERROR_ID}
        noModalAdvancedEditor
        clientConfig
        platformLanguage={defaultLocale}
        selectedLanguage={defaultLocale}
      />
      {descriptionHelpText && (
        <Text id="proposal_body-help" color="text.tertiary" fontSize="sm" mt={1}>
          {descriptionHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default DescriptionInput
