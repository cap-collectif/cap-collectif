import React, { Component } from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import { ButtonToolbar, Button } from 'react-bootstrap'
import component from '../Form/Field'
import AlertForm from '../Alert/AlertForm'
import UpdateProposalFormNotificationsConfigurationMutation from '../../mutations/UpdateProposalFormNotificationsConfigurationMutation'
import type { ProposalFormAdminNotificationForm_proposalForm } from '~relay/ProposalFormAdminNotificationForm_proposalForm.graphql'
import type { State, Dispatch } from '../../types'

type RelayProps = {
  proposalForm: ProposalFormAdminNotificationForm_proposalForm
}
type Props = RelayProps & {
  intl: IntlShape
  handleSubmit: () => void
  invalid: boolean
  pristine: boolean
  submitting: boolean
  valid: boolean
  submitSucceeded: boolean
  submitFailed: boolean
  isOnlyProjectAdmin: boolean
  organizationId: string | null
}
const formName = 'proposal-form-admin-notification'

const validate = () => ({})

const onSubmit = (values: Record<string, any>, dispatch: Dispatch, props: Props) => {
  const { proposalForm } = props
  const inputs = values
  inputs.proposalFormId = proposalForm.id
  return UpdateProposalFormNotificationsConfigurationMutation.commit({
    input: inputs,
  })
}

export class ProposalFormAdminNotificationForm extends Component<Props> {
  render() {
    const {
      intl,
      invalid,
      pristine,
      handleSubmit,
      submitting,
      valid,
      submitSucceeded,
      submitFailed,
      isOnlyProjectAdmin,
      organizationId,
    } = this.props
    const showEmailField: boolean = (isOnlyProjectAdmin || !!organizationId) ?? false
    return (
      <div className="box box-primary container-fluid mt-10">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.notification" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({
              id: 'admin.help.link.form.notifications',
            })}
          >
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <h4
              style={{
                fontWeight: 'bold',
                marginTop: 0,
              }}
            >
              <FormattedMessage id="proposal_form.notifications.label" />
            </h4>
            <Field name="onCreate" component={component} type="checkbox" id="proposal_form_notification_on_create">
              <FormattedMessage id="proposal_form.notifications.on_create" />
            </Field>
            <Field name="onUpdate" component={component} type="checkbox" id="proposal_form_notification_on_update">
              <FormattedMessage id="global.modified" />
            </Field>
            <Field name="onDelete" component={component} type="checkbox" id="proposal_form_notification_on_delete">
              <FormattedMessage id="global.deleted.feminine" />
            </Field>
            <h4
              style={{
                fontWeight: 'bold',
              }}
            >
              <FormattedMessage id="proposal_form.notifications_comment.label" />
            </h4>
            <Field
              name="onCommentCreate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_create"
            >
              <FormattedMessage id="proposal_form.notifications_comment.on_create" />
            </Field>
            <Field
              name="onCommentUpdate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_update"
            >
              <FormattedMessage id="proposal_form.notifications_comment.on_update" />
            </Field>
            <Field
              name="onCommentDelete"
              component={component}
              type="checkbox"
              id="proposal_form_notification_comment_on_delete"
            >
              <FormattedMessage id="global.deleted" />
            </Field>
            <h4
              style={{
                fontWeight: 'bold',
              }}
            >
              <FormattedMessage id="proposal_news.notification.label" />
            </h4>
            <Field
              name="onProposalNewsCreate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_proposal_news_on_create"
            >
              <FormattedMessage id="fast.filter.skeleton.published" />
            </Field>
            <Field
              name="onProposalNewsUpdate"
              component={component}
              type="checkbox"
              id="proposal_form_notification_proposal_news_on_update"
            >
              <FormattedMessage id="proposal_form.notifications_comment.on_update" />
            </Field>
            <Field
              name="onProposalNewsDelete"
              component={component}
              type="checkbox"
              id="proposal_form_notification_proposal_news_on_delete"
            >
              <FormattedMessage id="global.deleted" />
            </Field>
            {showEmailField && (
              <>
                <h4
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  <FormattedMessage id="admin.mail.notifications.receive_address" />
                </h4>
                <Field name="email" id="proposal_form_notification_email" type="text" component={component} />
              </>
            )}
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                id="notification-submit"
                type="submit"
                bsStyle="primary"
              >
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <Button bsStyle="danger" disabled>
                <FormattedMessage id="global.delete" />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </form>
        </div>
      </div>
    )
  }
}
const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ProposalFormAdminNotificationForm)

const mapStateToProps = (state: State, props: RelayProps) => {
  const { notificationsConfiguration } = props.proposalForm
  const { user } = state.user
  const isOnlyProjectAdmin = user?.isOnlyProjectAdmin
  const organizationId = user?.organizationId
  const showEmailField: boolean = (isOnlyProjectAdmin || !!organizationId) ?? false
  return {
    initialValues: {
      ...notificationsConfiguration,
      email: showEmailField ? notificationsConfiguration.email ?? props.proposalForm.creator?.email : null,
    },
    isOnlyProjectAdmin,
    organizationId,
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(form)
const intlContainer = injectIntl(container)
export default createFragmentContainer(intlContainer, {
  proposalForm: graphql`
    fragment ProposalFormAdminNotificationForm_proposalForm on ProposalForm {
      id
      creator {
        email
      }
      notificationsConfiguration {
        onCreate
        onUpdate
        onDelete
        onCommentCreate
        onCommentUpdate
        onCommentDelete
        onProposalNewsCreate
        onProposalNewsUpdate
        onProposalNewsDelete
        email
      }
    }
  `,
})
