import * as React from 'react'
import { useLazyLoadQuery, graphql, useFragment } from 'react-relay'
import { Modal } from 'react-bootstrap'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'
import Spinner from '~ds/Spinner/Spinner'
import Flex from '~ui/Primitives/Layout/Flex'
import ProjectContributors from '~/components/Admin/Emailing/ModalMembers/ProjectContributors'
import type { ModalProjectContributors_project$key } from '~relay/ModalProjectContributors_project.graphql'

type Props = {
  onClose: () => void
  show: boolean
  isAdmin: boolean
  projectRef: ModalProjectContributors_project$key | null | undefined
}
const FRAGMENT_PROJECT = graphql`
  fragment ModalProjectContributors_project on Project {
    id
    title
  }
`
const QUERY = graphql`
  query ModalProjectContributorsQuery(
    $count: Int
    $cursor: String
    $projectId: ID!
    $isAdmin: Boolean!
    $emailConfirmed: Boolean!
  ) {
    project: node(id: $projectId) {
      ... on Project {
        ...ProjectContributors_project
          @arguments(count: $count, cursor: $cursor, isAdmin: $isAdmin, emailConfirmed: $emailConfirmed)
      }
    }
  }
`
export const ModalProjectContributors = ({ show, onClose, projectRef, isAdmin }: Props) => {
  const project = useFragment(FRAGMENT_PROJECT, projectRef)
  const query = useLazyLoadQuery(QUERY, {
    projectId: project?.id,
    count: 10,
    isAdmin,
    emailConfirmed: true,
  })
  if (!project) return null
  return (
    <ModalContainer animation={false} show={show} onHide={onClose} bsSize="small" aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">{project?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {query ? (
          <ProjectContributors project={query.project} isAdmin={isAdmin} />
        ) : (
          <Flex direction="row" justify="center">
            <Spinner size="m" />
          </Flex>
        )}
      </Modal.Body>
    </ModalContainer>
  )
}
export default ModalProjectContributors
