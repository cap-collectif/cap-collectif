import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { Table, Link } from '@cap-collectif/ui'
import ModalConfirmationDelete from './ModalConfirmationDelete'
import type { QuestionnaireItem_questionnaire$key } from '@relay/QuestionnaireItem_questionnaire.graphql'
import { QuestionnaireItem_viewer$key } from '@relay/QuestionnaireItem_viewer.graphql'
import { QuestionnaireType } from '@relay/QuestionnaireListQuery.graphql'

type QuestionnaireItemProps = {
  questionnaire: QuestionnaireItem_questionnaire$key
  viewer: QuestionnaireItem_viewer$key
  connectionName: string
  types?: Array<QuestionnaireType>
}

const QUESTIONNAIRE_FRAGMENT = graphql`
  fragment QuestionnaireItem_questionnaire on Questionnaire {
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
      username
    }
    creator {
      id
      username
    }
    ...ModalConfirmationDelete_questionnaire
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment QuestionnaireItem_viewer on User {
    id
    isAdminOrganization
    isAdmin
    organizations {
      id
    }
  }
`

const QuestionnaireItem: React.FC<QuestionnaireItemProps> = ({
  questionnaire: questionnaireRef,
  viewer: viewerRef,
  connectionName,
  types,
}) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const questionnaire = useFragment(QUESTIONNAIRE_FRAGMENT, questionnaireRef)
  const intl = useIntl()

  const viewerBelongsToAnOrganization = (viewer.organizations?.length ?? 0) > 0
  const canDelete = viewerBelongsToAnOrganization
    ? viewer?.isAdminOrganization || viewer.id === questionnaire.creator?.id
    : true

  return (
    <>
      <Table.Td>
        <Link href={questionnaire.adminUrl}>{questionnaire.title}</Link>
      </Table.Td>
      <Table.Td>
        {questionnaire?.step?.project ? (
          <Link href={questionnaire.step.project.adminAlphaUrl}>{questionnaire.step.project.title}</Link>
        ) : (
          questionnaire?.step?.project?.title
        )}
      </Table.Td>
      <Table.Td>{questionnaire.creator?.username}</Table.Td>
      {viewer?.isAdmin || viewer?.isAdminOrganization ? <Table.Td>{questionnaire.owner?.username}</Table.Td> : null}
      <Table.Td>
        {intl.formatDate(questionnaire.updatedAt ?? undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(questionnaire.createdAt ?? undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td visibleOnHover>
        {canDelete && (
          <ModalConfirmationDelete types={types} questionnaire={questionnaire} connectionName={connectionName} />
        )}
      </Table.Td>
    </>
  )
}

export default QuestionnaireItem
