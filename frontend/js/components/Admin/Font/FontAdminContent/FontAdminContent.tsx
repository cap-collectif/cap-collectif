import React, { useState } from 'react'
import { FormattedHTMLMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import type { FontAdminContent_fonts } from '~relay/FontAdminContent_fonts.graphql'
import '~relay/FontAdminContent_fonts.graphql'
import FontAdminContentContainer from './FontAdminContent.style'
import FontForm from '../FontForm/FontForm'
import FontUseForm from '../FontUseForm/FontUseForm'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
type Props = {
  fonts: FontAdminContent_fonts
}
export type FormError = {
  readonly messageId: string
  readonly filename: string | null
}
export const FontAdminContent = ({ fonts }: Props) => {
  const [fontLoading, setFontLoading] = useState<File | null>(null)
  const [fontError, setFontError] = useState<FormError>({
    messageId: 'download-error',
    filename: null,
  })

  const handleFontLoading = (currentFontLoading: File | null) => {
    setFontLoading(currentFontLoading)
  }

  return (
    <FontAdminContentContainer>
      <FontUseForm fonts={fonts} fontLoading={fontLoading} />

      {fontError.filename && (
        <p className="error">
          <Icon name={ICON_NAME.error} size={15} />
          <FormattedHTMLMessage
            id={fontError.messageId}
            values={{
              fileName: fontError.filename,
            }}
          />
        </p>
      )}
      {!fontLoading && <FontForm handleFontLoading={handleFontLoading} handleFormError={setFontError} />}
    </FontAdminContentContainer>
  )
}
export default createFragmentContainer(FontAdminContent, {
  fonts: graphql`
    fragment FontAdminContent_fonts on Font @relay(plural: true) {
      id
      name
      useAsHeading
      useAsBody
      isCustom
    }
  `,
})
