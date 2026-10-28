import { Box, Button, ButtonGroup, CapUIModalSize, Flex, Heading, Modal, Radio, Text } from '@cap-collectif/ui'
import DeleteAccountMutation from '@mutations/DeleteAccountMutation'
import type { DeleteAccountType } from '@relay/DeleteAccountMutation.graphql'
import type { DeleteUserAccountModal_user$key } from '@relay/DeleteUserAccountModal_user.graphql'
import { mutationErrorToast } from '@shared/utils/toasts'
import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { SONATA_USER_LIST_URL } from './utils'

type Props = {
  user: DeleteUserAccountModal_user$key
}

const FRAGMENT = graphql`
  fragment DeleteUserAccountModal_user on User {
    id
    isViewer
    contributionsCount
    votes {
      totalCount
    }
  }
`

const DeleteUserAccountModal: React.FC<Props> = ({ user: userRef }) => {
  const intl = useIntl()
  const user = useFragment(FRAGMENT, userRef)
  const [removalType, setRemovalType] = React.useState<DeleteAccountType>('SOFT')
  const [isDeleting, setIsDeleting] = React.useState(false)

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      // Same behaviour as the legacy modal: deleting one's own account goes through the profile route, which logs out
      if (user.isViewer) {
        const { csrfToken } = await fetch('/profile/delete-account/csrf-token').then(response => response.json())
        window.location.href = `/profile/deleteAccount/${removalType}?csrfToken=${csrfToken}`
        return
      }

      const response = await DeleteAccountMutation.commit({ input: { type: removalType, userId: user.id } })
      if (response.deleteAccount?.errorCode) {
        mutationErrorToast(intl)
        setIsDeleting(false)
        return
      }
      // The success message is a flash message displayed by the user list
      window.location.href = SONATA_USER_LIST_URL
    } catch {
      mutationErrorToast(intl)
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      size={CapUIModalSize.Lg}
      ariaLabel={intl.formatMessage({ id: 'account-delete-confirmation' })}
      disclosure={
        <Button id="delete-account-profile-button" variant="secondary" variantColor="danger" variantSize="small">
          {intl.formatMessage({ id: 'global.delete' })}
        </Button>
      }
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'account-delete-confirmation' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text fontWeight="semibold" mb={4}>
              {intl.formatMessage({ id: 'account-delete-warning' })}
            </Text>
            {user.isViewer ? (
              // Only relevant for one's own account: the link targets the viewer's profile
              <Box mb={4}>
                <FormattedHTMLMessage id="alias-name-information" values={{ profileLink: '/profile/edit-profile' }} />
              </Box>
            ) : null}
            <Box mb={4}>
              <FormattedHTMLMessage
                id="data-amount-contributions-votes"
                values={{
                  contributionsNumber: user.contributionsCount,
                  votesNumber: user.votes.totalCount,
                  datePage: '',
                }}
              />
            </Box>
            <Box as="fieldset" border="none" p={0} m={0}>
              <Text as="legend" fontWeight="semibold" mb={2}>
                {intl.formatMessage({ id: 'deleting-options' })}
              </Text>
              <Flex direction="column" gap={4}>
                <Box id="delete-account-soft">
                  <Radio
                    id="delete-account-type-soft"
                    name="type-of-removal"
                    value="SOFT"
                    checked={removalType === 'SOFT'}
                    onChange={() => setRemovalType('SOFT')}
                  >
                    {intl.formatMessage({ id: 'delete-account-and-anonymize-contents' })}
                  </Radio>
                  <Box pl={6} color="gray.700">
                    <FormattedHTMLMessage
                      id="anonymizing-contributions-and-votes"
                      values={{
                        nbContributions: user.contributionsCount,
                        nbVotes: user.votes.totalCount,
                        nbEvents: 0,
                      }}
                    />
                  </Box>
                </Box>
                <Box id="delete-account-hard">
                  <Radio
                    id="delete-account-type-hard"
                    name="type-of-removal"
                    value="HARD"
                    checked={removalType === 'HARD'}
                    onChange={() => setRemovalType('HARD')}
                  >
                    {intl.formatMessage({ id: 'delete-account-and-contents' })}
                  </Radio>
                  <Box pl={6} color="gray.700">
                    <FormattedHTMLMessage
                      id="global-deleting-contributions-and-votes"
                      values={{
                        nbContributions: user.contributionsCount,
                        nbVotes: user.votes.totalCount,
                      }}
                    />
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'global.cancel' })}
              </Button>
              <Button
                id="confirm-delete-form-submit"
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                isLoading={isDeleting}
                onClick={onDelete}
              >
                {intl.formatMessage({ id: 'global.removeDefinitively' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default DeleteUserAccountModal
