import * as React from 'react'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIModalSize,
  Heading,
  headingStyles,
  Modal,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import KickFromOrganizationMutation from '@mutations/KickFromOrganizationMutation'
import { graphql, useFragment } from 'react-relay'
import { OrganizationConfigFormDeleteMemberModal_organization$key } from '@relay/OrganizationConfigFormDeleteMemberModal_organization.graphql'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { formatConnectionPath } from '@utils/relay'
import DeleteOrganizationInvitationMutation from '@mutations/DeleteOrganizationInvitationMutation'
export interface OrganizationConfigFormDeleteMemberModalProps {
  userName: string
  status: 'ACCEPTED' | 'PENDING'
  userId: string
  organization: OrganizationConfigFormDeleteMemberModal_organization$key
  inviteId?: string
}

const FRAGMENT = graphql`
  fragment OrganizationConfigFormDeleteMemberModal_organization on Organization {
    id
  }
`
const OrganizationConfigFormDeleteMemberModal: React.FC<OrganizationConfigFormDeleteMemberModalProps> = ({
  userName,
  status,
  userId,
  organization: orgRef,
  inviteId,
}) => {
  const intl = useIntl()
  const organization = useFragment(FRAGMENT, orgRef)
  const [isSubmitting] = React.useState(false)
  const onSubmit = () => {
    const membersConnectionId = formatConnectionPath(['client', organization.id || ''], 'OrgIdQuery_members')
    const pendingInvitationsConnectionId = formatConnectionPath(
      ['client', organization.id || ''],
      'OrgIdQuery_pendingOrganizationInvitations',
    )
    if (status === 'ACCEPTED') {
      KickFromOrganizationMutation.commit({
        input: { userId: userId, organizationId: organization.id },
        connections: [membersConnectionId],
      }).catch(() => {
        mutationErrorToast(intl)
      })
    }
    if (status === 'PENDING') {
      DeleteOrganizationInvitationMutation.commit({
        input: { invitationId: inviteId || '' },
        connections: [pendingInvitationsConnectionId],
      }).catch(() => {
        mutationErrorToast(intl)
      })
    }
  }
  return (
    <Modal
      size={CapUIModalSize.Md}
      disclosure={
        <ButtonQuickAction
          icon={CapUIIcon.Trash}
          variantColor="danger"
          label={intl.formatMessage({ id: 'global.delete' })}
        />
      }
      ariaLabel="delete-member"
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading color="blue.900" {...headingStyles.h2}>
              {intl.formatMessage({ id: 'organization.member.delete.modal.header' })}
            </Heading>
          </Modal.Header>
          <Modal.Body>
            {intl.formatMessage({ id: 'organization.member.delete.modal.body' }, { userName: userName })}
          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button variantSize="medium" variant="secondary" variantColor="hierarchy" onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                onClick={() => {
                  onSubmit()
                  hide()
                }}
                variantSize="medium"
                variant="primary"
                variantColor="danger"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {intl.formatMessage({ id: 'global.delete' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default OrganizationConfigFormDeleteMemberModal
