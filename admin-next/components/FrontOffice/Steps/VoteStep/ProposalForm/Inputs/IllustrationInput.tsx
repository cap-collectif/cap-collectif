import { FieldInput, FormControl } from '@cap-collectif/form'
import { CapUIFontSize, FormLabel, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Props = {
  control: Control<FormValues>
  illustrationHelpText: string | null
}

const IllustrationInput: React.FC<Props> = ({ control, illustrationHelpText }) => {
  const intl = useIntl()

  return (
    <FormControl name="media" control={control}>
      <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'proposal.media' })}>
        <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary" lineHeight={1}>
          {intl.formatMessage({ id: 'global.optional' })}
        </Text>
      </FormLabel>
      <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary" lineHeight={1}>
        {intl.formatMessage({ id: 'front.proposal-form.illustration-help-text' })}
      </Text>
      <FieldInput
        isFullWidth
        variantColor="default"
        type="uploader"
        control={control}
        name="media"
        id="media"
        format=".jpg,.jpeg,.png"
        maxFiles={1}
        maxSize={4000000}
        showThumbnail
        size={UPLOADER_SIZE.LG}
        uploadURI={UPLOAD_PATH}
      />
      {illustrationHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {illustrationHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default IllustrationInput
