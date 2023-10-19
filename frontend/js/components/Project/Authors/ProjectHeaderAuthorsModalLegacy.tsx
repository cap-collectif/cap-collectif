import * as React from 'react'
import styled from 'styled-components'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { ListGroupItem } from 'react-bootstrap'
import ListGroupFlush from '../../Ui/List/ListGroupFlush'
import Modal from '~ds/Modal/Modal'
import UserAvatar from '../../User/UserAvatar'
import Button from '~ds/Button/Button'
import Heading from '~ui/Primitives/Heading'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import type { ProjectHeaderAuthorsModalLegacy_project$key } from '~relay/ProjectHeaderAuthorsModalLegacy_project.graphql'
type Props = {
  readonly show: boolean
  readonly onClose: () => void
  readonly project: ProjectHeaderAuthorsModalLegacy_project$key
}
const ProjectAuthorItem = styled(ListGroupItem).attrs({
  className: 'projectAuthorItem',
})`
  border-right: none;
  border-left: none;
`
const ProjectAuthorList = styled(ListGroupFlush)`
  .projectAuthorItem:first-of-type {
    border-top: none;
  }

  .projectAuthorItem:last-of-type {
    border-bottom: none;
  }
`
const FRAGMENT = graphql`
  fragment ProjectHeaderAuthorsModalLegacy_project on Project {
    authors {
      ...UserAvatar_user
      id
      url
      username
      userType {
        name
      }
    }
  }
`

const ProjectHeaderAuthorsModalLegacy = ({ show, onClose, project }: Props): JSX.Element => {
  const profilesToggle = useFeatureFlag('profiles')
  const intl = useIntl()
  const data = useFragment(FRAGMENT, project)
  return (
    <Modal
      id="show-authors-modal"
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({
        id: 'project.authors',
      })}
    >
      <Modal.Header>
        <Heading>
          {intl.formatMessage(
            {
              id: 'number-of-authors',
            },
            {
              num: data.authors ? data.authors.length : 0,
            },
          )}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <ProjectAuthorList className="mb-0">
          {data.authors.map(user => (
            <ProjectAuthorItem key={user.id}>
              <div className="d-flex">
                <UserAvatar user={user} />
                <div className="d-flex fd-column">
                  {profilesToggle ? (
                    <a href={user.url}>{user.username}</a>
                  ) : (
                    <span className="font-weight-bold">{user.username}</span>
                  )}
                  <span className="excerpt">{user.userType ? user.userType.name : ''}</span>
                </div>
              </div>
            </ProjectAuthorItem>
          ))}
        </ProjectAuthorList>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <Button variant="primary" variantSize="medium" onClick={onClose}>
          {intl.formatMessage({
            id: 'global.close',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProjectHeaderAuthorsModalLegacy
