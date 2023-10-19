import * as React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import UserAvatarLegacy from '../../User/UserAvatarLegacy'
import Modal from '~ds/Modal/Modal'
import ListGroupFlush from '../../Ui/List/ListGroupFlush'
import type { UserInGroupModalLegacy_group$key } from '~relay/UserInGroupModalLegacy_group.graphql'
import Heading from '~ui/Primitives/Heading'
import Button from '~ds/Button/Button'

type RelayProps = {
  group: UserInGroupModalLegacy_group$key
}
type Props = RelayProps & {
  show: boolean
  handleClose: () => void
}
const FRAGMENT = graphql`
  fragment UserInGroupModalLegacy_group on Group
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" })
  @refetchable(queryName: "UsersInGroupLegacyListQuery") {
    id
    title
    users(first: $count, after: $cursor) @connection(key: "UserInGroupModalLegacy_users") {
      edges {
        node {
          id
          ...UserAvatarLegacy_user
          url
          username
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

const UserInGroupModalLegacy = ({ show, group, handleClose }: Props): JSX.Element => {
  const intl = useIntl()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(FRAGMENT, group)
  return (
    <Modal
      id={`${data.id}-modal`}
      show={show}
      onClose={handleClose}
      ariaLabel={intl.formatMessage({
        id: 'people-with-access-to-project',
      })}
    >
      <Modal.Header>
        <Heading id="contained-modal-title-lg">{data.title}</Heading>
      </Modal.Header>
      <Modal.Body>
        {data.users !== null && data.users.edges && data.users.edges.length > 0 && (
          <ListGroupFlush>
            {data.users.edges
              .filter(Boolean)
              .map(edge => edge && edge.node)
              .filter(Boolean)
              .map(user => (
                <ListGroupItem className="d-flex text-left" key={user.id} id={user.id}>
                  <UserAvatarLegacy user={user} />
                  <a
                    href={user.url}
                    className="align-self-center"
                    title={intl.formatMessage(
                      {
                        id: 'usernames-profile',
                      },
                      {
                        userName: user.username,
                      },
                    )}
                  >
                    {user.username}
                  </a>
                </ListGroupItem>
              ))}
            {hasNext && (
              <div className="text-center mt-15 mb-10">
                <Button
                  id="load-more"
                  variant="secondary"
                  variantSize="medium"
                  disabled={isLoadingNext}
                  onClick={() => loadNext(10)}
                >
                  <FormattedMessage id={isLoadingNext ? 'global.loading' : 'global.more'} />
                </Button>
              </div>
            )}
          </ListGroupFlush>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" variantSize="medium" onClick={handleClose}>
          <FormattedMessage id="global.close" />
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UserInGroupModalLegacy
