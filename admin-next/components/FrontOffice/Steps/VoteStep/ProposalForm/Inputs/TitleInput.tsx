import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'
import { isProposalLikeObjectType } from '@shared/constants/proposalStepObjectType'

type Props = {
  control: Control<FormValues>
  objectType: string
  titleHelpText: string | null
}

const TitleInput: React.FC<Props> = ({ control, objectType, titleHelpText }) => {
  const intl = useIntl()

  const getTitleLabel = () => {
    if (isProposalLikeObjectType(objectType)) return 'global.title'
    if (objectType === 'OPINION') return 'opinion-title'
    return 'title'
  }

  return (
    <FormControl errorId="proposal_title-error" name="title" control={control}>
      <FormLabel
        id="label-proposal_title"
        htmlFor="proposal_title"
        label={intl.formatMessage({ id: getTitleLabel() })}
      />
      <FieldInput type="text" control={control} name="title" id="proposal_title" />
      {titleHelpText && (
        <Text id="proposal_title-help" color="text.tertiary" fontSize="sm" mt={1}>
          {titleHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default TitleInput
