import * as React from 'react'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useState } from 'react'
import { Button, CapUIModalSize, Checkbox, Heading, Modal, Text } from '@cap-collectif/ui'
import DeleteOrganizationMutation from '@mutations/DeleteOrganizationMutation'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import { OrganizationConfigFormDeleteOrganizationModal_organization$key } from '@relay/OrganizationConfigFormDeleteOrganizationModal_organization.graphql'

export interface OrganizationConfigFormDeleteOrganizationModalProps {
  organization: OrganizationConfigFormDeleteOrganizationModal_organization$key
}
const FRAGMENT = graphql`
  fragment OrganizationConfigFormDeleteOrganizationModal_organization on Organization {
    id
    title
    projects {
      totalCount
      edges {
        node {
          id
          contributions {
            totalCount
          }
        }
      }
    }
    members(first: 50) @connection(key: "OrgIdQuery_members") {
      __id
      totalCount
      edges {
        node {
          user {
            id
            username
            email
          }
          role
        }
      }
    }
  }
`

const OrganizationConfigFormDeleteOrganizationModal: React.FC<OrganizationConfigFormDeleteOrganizationModalProps> = ({
  organization: orgRef,
}) => {
  const intl = useIntl()
  const [confirmed, setConfirmed] = useState(false)
  const organization = useFragment(FRAGMENT, orgRef)
  const deleteOrganisation = () => {
    DeleteOrganizationMutation.commit({ input: { organizationId: organization.id } })
      .then(response => {
        const errorCode = response.deleteOrganization?.errorCode
        if (errorCode === 'ORGANIZATION_ALREADY_ANONYMIZED') {
          return intl.formatMessage({ id: 'organization-already-deleted' })
        }
        if (errorCode) {
          return mutationErrorToast(intl)
        }
        window.open('/admin-next/organizations', '_self')
      })
      .catch(() => mutationErrorToast(intl))
  }
  const memberCount = organization.members?.totalCount
  const projectCount = organization.projects?.totalCount
  const contributionCount = organization.projects?.edges
    ?.filter(Boolean)
    .map(edge => edge?.node)
    .filter(Boolean)
    .reduce((acc: any, project) => {
      acc += project?.contributions.totalCount
      return acc
    }, 0)
  return (
    <Modal
      ariaLabel={intl.formatMessage({
        id: 'are-you-sure-you-want-to-delete-the-authentication-method',
      })}
      disclosure={
        <Button type="button" variant="secondary" variantColor="danger">
          {intl.formatMessage({ id: 'admin.global.delete' })}
        </Button>
      }
      size={CapUIModalSize.Lg}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'are-you-sure-you-want-to-delete-the-organisation',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body spacing={4}>
            <Text color="gray.900">
              <FormattedHTMLMessage
                id="you-will-delete-organisation"
                values={{
                  orgName: organization.title,
                  contributionCount: contributionCount,
                  memberCount: memberCount,
                  projectCount: projectCount,
                }}
              />
            </Text>
            <Checkbox checked={confirmed} onChange={() => setConfirmed(!confirmed)} id="confirmed-action">
              {intl.formatMessage({ id: 'admin.project.delete.confirm' })}
            </Checkbox>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="medium" onClick={hide}>
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
              variant="primary"
              variantColor="danger"
              variantSize="medium"
              disabled={!confirmed}
              onClick={() => deleteOrganisation()}
            >
              {intl.formatMessage({ id: 'global.delete' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default OrganizationConfigFormDeleteOrganizationModal
