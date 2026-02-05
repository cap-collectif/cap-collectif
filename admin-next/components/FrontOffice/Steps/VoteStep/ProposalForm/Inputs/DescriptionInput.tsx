import { Box, Text } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  descriptionMandatory: boolean
  descriptionHelpText: string | null
  defaultLocale: string
}

const DescriptionInput: React.FC<Props> = ({ descriptionMandatory, descriptionHelpText, defaultLocale }) => {
  const intl = useIntl()

  return (
    <Box>
      <TextEditor
        label={intl.formatMessage({ id: 'proposal.body' })}
        name="body"
        id="body"
        placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
        required={descriptionMandatory}
        noModalAdvancedEditor
        platformLanguage={defaultLocale}
        selectedLanguage={defaultLocale}
      />
      {descriptionHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {descriptionHelpText}
        </Text>
      )}
    </Box>
  )
}

export default DescriptionInput
