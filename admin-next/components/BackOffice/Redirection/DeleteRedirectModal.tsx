import * as React from 'react'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  Popover,
  Text,
} from '@cap-collectif/ui'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import DeleteHttpRedirectMutation from 'mutations/DeleteHttpRedirectMutation'
import { useIntl } from 'react-intl'
import { RedirectRow } from './types'

type DeleteRedirectModalProps = {
  connectionId?: string | null
  redirect: RedirectRow
  disclosure?: React.ReactNode
}

const DeleteRedirectModal: React.FC<DeleteRedirectModalProps> = ({ connectionId, redirect, disclosure }) => {
  const intl = useIntl()

  const submitDeleteRedirect = async (closePopover: () => void) => {
    try {
      const response = await DeleteHttpRedirectMutation.commit(
        {
          input: {
            id: redirect.id,
          },
        },
        connectionId,
      )
      const errorCode = response.deleteHttpRedirect?.errorCode
      if (errorCode) {
        return mutationErrorToast(intl)
      }

      successToast(intl.formatMessage({ id: 'redirect-url.deleted' }))
      closePopover()
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <Popover
      placement="left"
      disclosure={
        (disclosure as React.FunctionComponentElement<any>) ?? (
          <ButtonQuickAction
            icon={CapUIIcon.Trash}
            size={CapUIIconSize.Md}
            variantColor="danger"
            label={intl.formatMessage({ id: 'global.delete' })}
          />
        )
      }
    >
      {({ closePopover }: { closePopover: () => void }) => (
        <>
          <Popover.Header closeButton>
            <Text fontWeight={CapUIFontWeight.Semibold}>{intl.formatMessage({ id: 'delete-confirmation' })}</Text>
          </Popover.Header>
          <Popover.Body>
            <Text>{intl.formatMessage({ id: 'redirect-url.are-you-sure-to-delete-something' })}</Text>
          </Popover.Body>
          <Popover.Footer justify="flex-start" mt="md">
            <ButtonGroup>
              <Button variant="secondary" variantColor="hierarchy" variantSize="small" onClick={closePopover}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variant="primary"
                variantColor="danger"
                variantSize="small"
                onClick={() => submitDeleteRedirect(closePopover)}
              >
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Popover.Footer>
        </>
      )}
    </Popover>
  )
}

export default DeleteRedirectModal
