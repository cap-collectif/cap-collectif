import * as React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import { Heading, Button, Modal, CapUIModalSize } from '@cap-collectif/ui'
import UserAvatar from '../../User/UserAvatar'
import ListGroupFlush from '../../Ui/List/ListGroupFlush'
import type { UserInGroupModal_group$key } from '~relay/UserInGroupModal_group.graphql'
import ResetCss from '~/utils/ResetCss'

type RelayProps = {
  group: UserInGroupModal_group$key
}
type Props = RelayProps & {
  show: boolean
  handleClose: () => void
}
const FRAGMENT = graphql`
  fragment UserInGroupModal_group on Group
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" })
  @refetchable(queryName: "UsersInGroupListQuery") {
    id
    title
    users(first: $count, after: $cursor) @connection(key: "UserInGroupModal_users") {
      edges {
        node {
          id
          ...UserAvatar_user
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

const UserInGroupModal = ({ show, group, handleClose }: Props): JSX.Element => {
  const intl = useIntl()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(FRAGMENT, group)
  return (
    <Modal
      baseId={`${data.id}-modal`}
      id={`${data.id}-modal`}
      show={show}
      onClose={handleClose}
      ariaLabel={intl.formatMessage({
        id: 'people-with-access-to-project',
      })}
      size={CapUIModalSize.Lg}
    >
      <ResetCss>
        <Modal.Header>
          <Heading id="contained-modal-title-lg">{data.title}</Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body>
        {data.users !== null && data.users.edges && data.users.edges.length > 0 && (
          <ListGroupFlush>
            {data.users.edges
              .filter(Boolean)
              .map(edge => edge && edge.node)
              .filter(Boolean)
              .map(user => (
                <ListGroupItem className="d-flex text-left" key={user.id} id={user.id}>
                  <UserAvatar user={user} />
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

export default UserInGroupModal
