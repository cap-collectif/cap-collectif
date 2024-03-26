import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { hasSubmitFailed, hasSubmitSucceeded, isInvalid, isSubmitting, isValid } from 'redux-form'
import type { GroupAdminUsers_group$key } from '~relay/GroupAdminUsers_group.graphql'
import AlertForm from '../../Alert/AlertForm'
import AlertFormSucceededMessage from '../../Alert/AlertFormSucceededMessage'
import GroupAdminUsersListGroupItem from './GroupAdminUsersListGroupItem'
import GroupAdminModalAddUsers from './GroupAdminModalAddUsers'
import GroupAdminModalImportUsers from './GroupAdminModalImportUsers'
import type { GlobalState } from '~/types'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import GroupAdminPendingInvitationsList from '~/components/Group/Admin/GroupAdminPendingInvitationsList'
import type { GroupAdminPendingInvitationsList_group$key } from '~relay/GroupAdminPendingInvitationsList_group.graphql'

type Props = ReduxFormFormProps & {
  group: GroupAdminUsers_group$key
  pendingInvitationFragmentRef: GroupAdminPendingInvitationsList_group$key
  userIsDeleted: boolean
  userIsNotDeleted: boolean
}
export const formName = 'group-admin-users'
const FRAGMENT = graphql`
  fragment GroupAdminUsers_group on Group
  @argumentDefinitions(countUsers: { type: "Int!" }, cursorUsers: { type: "String" })
  @refetchable(queryName: "GroupAdminUsersGroup") {
    id
    title
    users(first: $countUsers, after: $cursorUsers) @connection(key: "GroupAdminUsers_users") {
      edges {
        node {
          id
          ...GroupAdminUsersListGroupItem_user
        }
      }
    }
  }
`
export const GroupAdminUsers = ({ group: groupFragmentRef, pendingInvitationFragmentRef, ...props }: Props) => {
  const intl = useIntl()
  const [showAddUsersModal, setShowAddUsersModal] = React.useState(false)
  const [showImportUsersModal, setShowImportUsersModal] = React.useState(false)
  const { data: group, hasNext, loadNext, isLoadingNext } = usePaginationFragment(FRAGMENT, groupFragmentRef)

  const getAlertForm = () => {
    const { valid, invalid, submitting, submitSucceeded, submitFailed, userIsDeleted, userIsNotDeleted } = props

    if (userIsDeleted) {
      return (
        <div className="d-ib">
          <AlertFormSucceededMessage />
        </div>
      )
    }

    if (userIsNotDeleted) {
      return <AlertForm valid={false} invalid={false} submitSucceeded={false} submitFailed submitting={false} />
    }

    return (
      <AlertForm
        valid={valid}
        invalid={invalid}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
        submitting={submitting}
      />
    )
  }

  const handleClose = () => {
    setShowAddUsersModal(false)
    setShowImportUsersModal(false)
  }

  return (
    <div className="box box-primary container-fluid">
      <div className="box-header  pl-0">
        <h3 className="box-title">
          <FormattedMessage id="admin.fields.group.number_users" />
        </h3>
        <a
          className="pull-right link"
          target="_blank"
          rel="noopener noreferrer"
          href={intl.formatMessage({
            id: 'admin.help.addGroup.link',
          })}
        >
          <i className="fa fa-info-circle" /> Aide
        </a>
      </div>
      <div className="box-content">
        <ButtonToolbar>
          <Button bsStyle="success" onClick={() => setShowAddUsersModal(true)}>
            <i className="fa fa-plus-circle" /> <FormattedMessage id="group-admin-add-members" />
          </Button>
          <Button bsStyle="success" onClick={() => setShowImportUsersModal(true)}>
            <i className="fa fa-upload" /> <FormattedMessage id="group-admin-add-members-via-file" />
          </Button>
        </ButtonToolbar>
        {getAlertForm()}
        <GroupAdminModalAddUsers show={showAddUsersModal} onClose={handleClose} group={group} />
        {/* @ts-expect-error please use mapDispatchToProps */}
        <GroupAdminModalImportUsers show={showImportUsersModal} onClose={handleClose} group={group} />
        {group.users.edges ? (
          <ListGroup className="mt-15">
            {group.users.edges
              .map(edge => edge && edge.node) // https://stackoverflow.com/questions/44131502/filtering-an-array-of-maybe-nullable-types-in-flow-to-remove-null-values
              .filter(Boolean)
              .map(user => (
                <GroupAdminUsersListGroupItem key={user.id} user={user} groupId={group.id} groupTitle={group.title} />
              ))}
          </ListGroup>
        ) : (
          <div className="mb-15">
            <FormattedMessage id="group.admin.no_users" />
          </div>
        )}
        {hasNext && (
          <ListGroupItem
            style={{
              textAlign: 'center',
            }}
          >
            {isLoadingNext ? (
              <Loader />
            ) : (
              <Button bsStyle="link" onClick={() => loadNext(100)}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </ListGroupItem>
        )}
        <GroupAdminPendingInvitationsList pendingInvitationFragmentRef={pendingInvitationFragmentRef} />
      </div>
    </div>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  valid: isValid('group-users-add')(state),
  invalid: isInvalid('group-users-add')(state),
  submitting: isSubmitting('group-users-add')(state),
  submitSucceeded: hasSubmitSucceeded('group-users-add')(state),
  submitFailed: hasSubmitFailed('group-users-add')(state),
  userIsDeleted: state.user.groupAdminUsersUserDeletionSuccessful,
  userIsNotDeleted: state.user.groupAdminUsersUserDeletionFailed,
})

// @ts-ignore
const container = connect(mapStateToProps)(GroupAdminUsers)
export default container
