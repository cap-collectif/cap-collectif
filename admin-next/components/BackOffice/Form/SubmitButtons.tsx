import { Button, Flex } from '@cap-collectif/ui'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

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

  type SubmitButtonType = 'create' | 'create-and-publish' | null

  const submitButtonRef = React.useRef<SubmitButtonType | null>(null)

  return (
    <Flex direction="row" spacing={4}>
      {isCreating ? (
        <>
          <Button
            id="create-and-publish"
            isLoading={isSubmitting && submitButtonRef.current === 'create-and-publish'}
            type="submit"
            onClick={() => {
              submitButtonRef.current = 'create-and-publish'
              setValue('isPublished', true)
            }}
          >
            {intl.formatMessage({ id: 'admin.post.createAndPublish' })}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            variantColor="primary"
            isLoading={isSubmitting && submitButtonRef.current === 'create'}
            onClick={() => (submitButtonRef.current = 'create')}
          >
            {intl.formatMessage({ id: 'btn_create' })}
          </Button>
          <Button variant="tertiary" variantColor="hierarchy" onClick={() => (window.location.href = backUrl)}>
            {intl.formatMessage({ id: 'global.cancel' })}
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
