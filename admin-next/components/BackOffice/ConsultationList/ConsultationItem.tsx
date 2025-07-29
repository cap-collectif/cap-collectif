import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { Table, Link } from '@cap-collectif/ui'
import type { ConsultationItem_consultation$key } from '@relay/ConsultationItem_consultation.graphql'
import ModalConfirmationDelete from '@components/BackOffice/ConsultationList/ModalConfirmationDelete'

type ConsultationItemProps = {
  consultation: ConsultationItem_consultation$key
  connectionName: string
}

const CONSULTATION_FRAGMENT = graphql`
  fragment ConsultationItem_consultation on Consultation {
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
    ...ModalConfirmationDelete_consultation
  }
`

const ConsultationItem: React.FC<ConsultationItemProps> = ({ consultation: consultationRef, connectionName }) => {
  const consultation = useFragment(CONSULTATION_FRAGMENT, consultationRef)
  const intl = useIntl()

  return (
    <>
      <Table.Td>
        <Link href={consultation.adminUrl}>{consultation.title}</Link>
      </Table.Td>
      <Table.Td>
        {consultation?.step?.project ? (
          <Link href={consultation.step.project.adminAlphaUrl}>{consultation.step.project.title}</Link>
        ) : (
          consultation?.step?.project?.title
        )}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(consultation.updatedAt ?? undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(consultation.createdAt ?? undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td visibleOnHover>
        <ModalConfirmationDelete consultation={consultation} connectionName={connectionName} />
      </Table.Td>
    </>
  )
}

export default ConsultationItem
