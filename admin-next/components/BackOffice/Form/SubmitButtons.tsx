import * as React from 'react'
import { useIntl } from 'react-intl'
import { Flex, Button } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'

type Props = {
  isCreating?: boolean
  deleteComponent: React.ReactNode
  backUrl: string
}

const SubmitButtons: React.FC<Props> = ({ isCreating, deleteComponent, backUrl }) => {
  const intl = useIntl()
  const {
    setValue,
    formState: { isSubmitting },
  } = useFormContext()

  return (
    <Flex direction="row" spacing={4}>
      {isCreating ? (
        <>
          <Button
            id="create-and-publish"
            isLoading={isSubmitting}
            type="submit"
            onClick={() => {
              setValue('isPublished', true)
            }}
          >
            {intl.formatMessage({ id: 'admin.post.createAndPublish' })}
          </Button>
          <Button type="submit" variant="secondary" variantColor="primary" isLoading={isSubmitting}>
            {intl.formatMessage({ id: 'btn_create' })}
          </Button>
          <Button variant="tertiary" variantColor="hierarchy" onClick={() => (window.location.href = backUrl)}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        </>
      ) : (
        <>
          <Button isLoading={isSubmitting} type="submit" id="save-event">
            {intl.formatMessage({ id: 'global.save' })}
          </Button>
          {deleteComponent}
        </>
      )}
    </Flex>
  )
}

export default SubmitButtons
