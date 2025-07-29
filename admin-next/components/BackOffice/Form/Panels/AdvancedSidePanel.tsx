import * as React from 'react'
import { Accordion, CapInputSize, FormLabel } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'

type Props = {
  currentLocale: string
  showTransfer?: boolean
  isDisabledExceptForAdmin?: boolean
}

const AdvancedSidePanel: React.FC<Props> = ({ currentLocale, showTransfer = false, isDisabledExceptForAdmin }) => {
  const intl = useIntl()
  const { control } = useFormContext()

  return (
    <>
      <Accordion.Button>
        {intl.formatMessage({
          id: 'admin.fields.blog_post.advanced',
        })}
      </Accordion.Button>
      <Accordion.Panel>
        {showTransfer ? (
          <FormControl name="adminAuthorizeDataTransfer" control={control}>
            <FieldInput
              type="checkbox"
              name="adminAuthorizeDataTransfer"
              control={control}
              id="adminAuthorizeDataTransfer"
            >
              {intl.formatMessage({ id: 'authorize-transfer-of-data-to-event-organizer' })}
            </FieldInput>
          </FormControl>
        ) : null}
        <FormControl
          name={`${currentLocale}-metaDescription`}
          key={`${currentLocale}-metaDescription`}
          control={control}
        >
          <FormLabel
            htmlFor={`${currentLocale}-metaDescription`}
            label={intl.formatMessage({ id: 'global.meta.description' })}
          />
          <FieldInput
            type="textarea"
            id={`${currentLocale}-metaDescription`}
            name={`${currentLocale}-metaDescription`}
            control={control}
            variantSize={CapInputSize.Sm}
            disabled={isDisabledExceptForAdmin}
          />
        </FormControl>
        <FormControl name="customCode" control={control} key="customCode">
          <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })} />
          <FieldInput
            type="textarea"
            name="customCode"
            placeholder={intl.formatMessage({ id: 'admin.customcode.placeholder' })}
            control={control}
            id="customCode"
            disabled={isDisabledExceptForAdmin}
          />
        </FormControl>
      </Accordion.Panel>
    </>
  )
}

export default AdvancedSidePanel
