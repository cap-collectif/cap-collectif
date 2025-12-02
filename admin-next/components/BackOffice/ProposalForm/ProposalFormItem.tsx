import { ButtonGroup, ButtonQuickAction, CapUIIcon, Link, Table } from '@cap-collectif/ui'
import type {
  ProposalFormItem_proposalForm$data,
  ProposalFormItem_proposalForm$key,
} from '@relay/ProposalFormItem_proposalForm.graphql'
import { ProposalFormItem_viewer$key } from '@relay/ProposalFormItem_viewer.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import DuplicateProposalFormMutation from 'mutations/DuplicateProposalFormMutation'
import * as React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import ModalConfirmationDelete from './ModalConfirmationDelete'

export type Viewer = ProposalFormItem_proposalForm$data['owner']
export type Creator = ProposalFormItem_proposalForm$data['creator']

type ProposalFormItemProps = {
  proposalForm: ProposalFormItem_proposalForm$key
  viewer: ProposalFormItem_viewer$key
  connectionName: string
}

const PROPOSALFORM_FRAGMENT = graphql`
  fragment ProposalFormItem_proposalForm on ProposalForm {
    id
    title
    adminUrl
    createdAt
    updatedAt
    step {
      project {
        title
        adminAlphaUrl
      }
    }
    owner {
      __typename
      id
      username
    }
    creator {
      __typename
      id
      username
    }
    ...ModalConfirmationDelete_proposalForm
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment ProposalFormItem_viewer on User {
    id
    isAdminOrganization
    isAdmin
    organizations {
      id
    }
  }
`

const duplicateProposalForm = (
  proposalFormDuplicated: ProposalFormItem_proposalForm$data,
  intl: IntlShape,
  owner: Viewer,
  creator: Creator,
  connectionName: string,
) => {
  const input = {
    id: proposalFormDuplicated.id,
  }

  return DuplicateProposalFormMutation.commit(
    {
      input,
      connections: [connectionName],
    },
    proposalFormDuplicated,
    owner,
    creator,
    intl,
  ).then(response => {
    if (response.duplicateProposalForm?.error) {
      return mutationErrorToast(intl)
    }

    successToast(intl.formatMessage({ id: 'proposal-form-successfully-duplicated' }))
  })
}

const ProposalFormItem: React.FC<ProposalFormItemProps> = ({
  proposalForm: proposalFormFragment,
  viewer: viewerFragment,
  connectionName,
}) => {
  const proposalForm = useFragment(PROPOSALFORM_FRAGMENT, proposalFormFragment)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const intl = useIntl()

  const viewerBelongsToAnOrganization = (viewer.organizations?.length ?? 0) > 0
  const canDelete = viewerBelongsToAnOrganization
    ? viewer?.isAdminOrganization || viewer.id === proposalForm.creator?.id
    : true

  return (
    <>
      <Table.Td>
        <Link href={proposalForm.adminUrl}>{proposalForm.title}</Link>
      </Table.Td>
      <Table.Td>
        {proposalForm?.step?.project ? (
          <Link href={proposalForm.step.project.adminAlphaUrl}>{proposalForm.step.project.title}</Link>
        ) : (
          proposalForm?.step?.project?.title
        )}
      </Table.Td>
      <Table.Td>{proposalForm.creator?.username}</Table.Td>
      {viewer?.isAdmin || viewer?.isAdminOrganization ? <Table.Td>{proposalForm.owner?.username}</Table.Td> : null}
      <Table.Td>
        {intl.formatDate(proposalForm?.updatedAt ?? undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(proposalForm.createdAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td visibleOnHover>
        <ButtonGroup>
          <ButtonQuickAction
            icon={CapUIIcon.Duplicate}
            label={intl.formatMessage({ id: 'duplicate' })}
            variantColor="primary"
            onClick={() =>
              duplicateProposalForm(proposalForm, intl, proposalForm.owner, proposalForm.creator, connectionName)
            }
            className="btn-duplicate"
          />
          {canDelete && <ModalConfirmationDelete proposalForm={proposalForm} connectionName={connectionName} />}
        </ButtonGroup>
      </Table.Td>
    </>
  )
}

export default ProposalFormItem
