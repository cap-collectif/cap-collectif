import TextEditor from '../../Form/TextEditor/TextEditor'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  defaultLocale?: string
  isEditing: boolean
}

const BodyInput: React.FC<Props> = ({ defaultLocale, isEditing }) => {
  const intl = useIntl()
  return (
    <TextEditor
      name="body"
      label={intl.formatMessage({ id: 'step-description' })}
      platformLanguage={defaultLocale}
      selectedLanguage={defaultLocale}
      buttonLabels={{
        submit: isEditing ? intl.formatMessage({ id: 'global.edit' }) : intl.formatMessage({ id: 'global.add' }),
      }}
      advancedEditor
    />
  )
}

export default BodyInput
