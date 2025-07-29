import * as React from 'react'
import { Accordion, FormLabel } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'

const PublicationSidePanel: React.FC<{
  showDate?: boolean
  showPublished?: boolean
  children?: React.ReactNode
  isDisabledExceptForAdmin?: boolean
  isDisabled?: boolean
}> = ({ showDate = false, showPublished = true, children, isDisabledExceptForAdmin, isDisabled }) => {
  const intl = useIntl()
  const { control } = useFormContext()

  return (
    <>
      <Accordion.Button>
        {intl.formatMessage({
          id: 'global.publication',
        })}
      </Accordion.Button>
      <Accordion.Panel>
        {showDate ? (
          <FormControl name="publishedAt" control={control} mb={0}>
            <FormLabel htmlFor="publishedAt" label={intl.formatMessage({ id: 'global.admin.published_at' })} />
            <FieldInput type="dateHour" name={'publishedAt'} control={control} id="publishedAt">
              {intl.formatMessage({ id: 'global.admin.published_at' })}
            </FieldInput>
          </FormControl>
        ) : null}
        {showPublished ? (
          <FormControl name="isPublished" control={control}>
            <FieldInput type="checkbox" name="isPublished" control={control} id="isPublished" isDisabled={isDisabled}>
              {intl.formatMessage({ id: 'global.published' })}
            </FieldInput>
          </FormControl>
        ) : null}
        {children}
        <FormControl name="commentable" control={control}>
          <FieldInput
            type="checkbox"
            name="commentable"
            control={control}
            id="commentable"
            disabled={isDisabledExceptForAdmin}
          >
            {intl.formatMessage({ id: 'admin.post.comments_authorised' })}
          </FieldInput>
        </FormControl>
      </Accordion.Panel>
    </>
  )
}

export default PublicationSidePanel
