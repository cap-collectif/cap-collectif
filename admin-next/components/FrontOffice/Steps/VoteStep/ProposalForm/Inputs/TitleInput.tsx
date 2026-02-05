import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Props = {
  control: Control<FormValues>
  objectType: string
  titleHelpText: string | null
}

const TitleInput: React.FC<Props> = ({ control, objectType, titleHelpText }) => {
  const intl = useIntl()

  const getTitleLabel = () => {
    if (objectType === 'PROPOSAL') return 'global.title'
    if (objectType === 'OPINION') return 'opinion-title'
    return 'title'
  }

  return (
    <FormControl name="title" control={control}>
      <FormLabel htmlFor="title" label={intl.formatMessage({ id: getTitleLabel() })} />
      <FieldInput type="text" control={control} name="title" id="title" />
      {titleHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {titleHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default TitleInput
