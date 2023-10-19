import * as React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import Button from '~ds/Button/Button'
import Modal from '~ds/Modal/Modal'
import UserInGroupModalLegacy from './UserInGroupModalLegacy'
import GroupAvatar from '../../User/GroupAvatar'
import ListGroupFlush from '../../Ui/List/ListGroupFlush'
import type { UserGroupModalLegacy_project$key } from '~relay/UserGroupModalLegacy_project.graphql'
import Heading from '~ui/Primitives/Heading'

type Props = {
  project: UserGroupModalLegacy_project$key
  show: boolean
  handleClose: () => void
}
const FRAGMENT = graphql`
  fragment UserGroupModalLegacy_project on Project
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" })
  @refetchable(queryName: "RestrictedViewersLegacyListQuery") {
    id
    restrictedViewers(first: $count, after: $cursor) @connection(key: "UserGroupModalLegacy_restrictedViewers") {
      edges {
        node {
          id
          title
          ...UserInGroupModalLegacy_group @arguments(count: $count, cursor: $cursor)
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

const UserGroupModalLegacy = ({ show, project, handleClose }: Props): JSX.Element => {
  const intl = useIntl()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(FRAGMENT, project)
  const [currentShownGroupModalId, setCurrentShownGroupModalId] = React.useState(null)

  const loadMore = () => {
    loadNext(10)
  }

  return (
    <Modal
      show={show}
      onClose={handleClose}
      ariaLabel={intl.formatMessage({
        id: 'groups-with-access-to-project',
      })}
    >
      <Modal.Header>
        <Heading>
          {intl.formatMessage({
            id: 'people-with-access-to-project',
          })}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        {data.restrictedViewers && data.restrictedViewers.edges && data.restrictedViewers.edges.length > 0 && (
          <ListGroupFlush className="d-flex text-left">
            {data.restrictedViewers.edges
              .filter(Boolean)
              .map(edge => edge && edge.node)
              .filter(Boolean)
              .map(group => (
                <ListGroupItem key={group.id} id={group.id}>
                  <GroupAvatar size={35} />
                  <Button
                    variant="link"
                    className="btn-md p-0"
                    onClick={() => {
                      setCurrentShownGroupModalId(group.id)
                    }}
                    title={intl.formatMessage(
                      {
                        id: 'persons-in-the-group',
                      },
                      {
                        groupName: group.title,
                      },
                    )}
                  >
                    {group.title}
                  </Button>
                  <UserInGroupModalLegacy
                    group={group}
                    show={currentShownGroupModalId === group.id}
                    handleClose={() => setCurrentShownGroupModalId(null)}
                  />
                </ListGroupItem>
              ))}
            {hasNext && (
              <div className="text-center">
                <Button variant="primary" onClick={loadMore} disabled={isLoadingNext}>
                  {intl.formatMessage({
                    id: isLoadingNext ? 'global.loading' : 'global.more',
                  })}
                </Button>
              </div>
            )}
          </ListGroupFlush>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" variantSize="medium" onClick={handleClose}>
          {intl.formatMessage({
            id: 'global.close',
          })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UserGroupModalLegacy
