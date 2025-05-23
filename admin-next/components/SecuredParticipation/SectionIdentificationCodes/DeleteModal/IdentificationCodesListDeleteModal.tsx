import { FC, useState, Suspense } from 'react'
import {
  Button,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Checkbox,
  Heading,
  Modal,
  Spinner,
  Text,
  toast,
} from '@cap-collectif/ui'
import { FormattedHTMLMessage, IntlShape, useIntl } from 'react-intl'
import type { IdentificationCodesListDeleteModal_userIdentificationCodeList$key } from '@relay/IdentificationCodesListDeleteModal_userIdentificationCodeList.graphql'

import { graphql, useFragment } from 'react-relay'
import DeleteUserIdentificationCodeListMutation from '@mutations/DeleteUserIdentificationCodeListMutation'
import IdentificationCodesListDeleteModalWarningProjects from './IdentificationCodesListDeleteModalWarningProjects'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'

const FRAGMENT = graphql`
  fragment IdentificationCodesListDeleteModal_userIdentificationCodeList on UserIdentificationCodeList {
    id
    name
  }
`

const deleteList = (id: string, connectionName: string, intl: IntlShape): void => {
  DeleteUserIdentificationCodeListMutation.commit({
    input: { id },
  }).then(response => {
    if (response.deleteUserIdentificationCodeList?.errorCode) {
      return mutationErrorToast(intl)
    }

    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'confirmation-delete-list' }),
    })
  })
}

type IdentificationCodesListDeleteModalProps = {
  userIdentificationCodeList: IdentificationCodesListDeleteModal_userIdentificationCodeList$key
  connectionName: string
}

const IdentificationCodesListDeleteModal: FC<IdentificationCodesListDeleteModalProps> = ({
  userIdentificationCodeList: userIdentificationCodeListFragment,
  connectionName,
}) => {
  const intl = useIntl()
  const userIdentificationCodeList = useFragment(FRAGMENT, userIdentificationCodeListFragment)
  const [understood, setUnderstood] = useState(false)

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'title-delete-mailing-list-confirmation' }, { num: 1 })}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          label={intl.formatMessage({ id: 'action_delete' })}
          variantColor="danger"
        />
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'title-delete-mailing-list-confirmation' }, { num: 1 })}</Heading>
          </Modal.Header>

          <Modal.Body>
            <Suspense fallback={<Spinner />}>
              <IdentificationCodesListDeleteModalWarningProjects />
            </Suspense>

            <Text mt={1} mb={2}>
              <FormattedHTMLMessage
                id="identification-code-delete-warning"
                values={{ listName: userIdentificationCodeList.name }}
              />
            </Text>

            <Checkbox
              id="checkbox-understood-cannot-cancel"
              onChange={() => {
                setUnderstood(!understood)
              }}
            >
              {intl.formatMessage({ id: 'understood-cannot-cancel' })}
            </Checkbox>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={hide} variant="secondary" variantSize="big" variantColor="hierarchy">
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
              variantColor="danger"
              variantSize="big"
              disabled={!understood}
              onClick={() => {
                deleteList(userIdentificationCodeList.id, connectionName, intl)
                hide()
              }}
            >
              {intl.formatMessage({ id: 'action_delete' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default IdentificationCodesListDeleteModal
