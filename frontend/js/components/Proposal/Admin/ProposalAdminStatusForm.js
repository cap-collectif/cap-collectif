// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ToggleButton, Button, ButtonToolbar } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import moment from 'moment';
import AlertForm from '../../Alert/AlertForm';
import component from '../../Form/Field';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import DeleteProposalMutation from '../../../mutations/DeleteProposalMutation';
import type {
  ProposalPublicationStatus,
  ProposalAdminStatusForm_proposal,
} from '~relay/ProposalAdminStatusForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type DefaultProps = void;
type RelayProps = {| proposal: ProposalAdminStatusForm_proposal |};
type Props = {|
  ...RelayProps,
  publicationStatus: string,
  isSuperAdmin: boolean,
  pristine: boolean,
  invalid: boolean,
  valid: boolean,
  submitSucceeded: boolean,
  submitFailed: boolean,
  submitting: boolean,
  dispatch: Dispatch,
  handleSubmit: () => void,
  intl: IntlShape,
|};
type FormValues = {
  publicationStatus: ProposalPublicationStatus,
  trashedReason: ?string,
};

const formName = 'proposal-admin-status';
const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    publicationStatus: values.publicationStatus,
    proposalId: props.proposal.id,
    trashedReason: undefined,
  };
  if (values.trashedReason) {
    input.trashedReason = values.trashedReason;
  }
  return ChangeProposalPublicationStatusMutation.commit({
    input,
  });
};

const onDelete = (proposalId: string) =>
  DeleteProposalMutation.commit({
    input: {
      proposalId,
    },
  });

export class ProposalAdminStatusForm extends Component<Props> {
  static defaultProps: DefaultProps;

  render() {
    const {
      isSuperAdmin,
      proposal,
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      submitting,
      handleSubmit,
      publicationStatus,
      dispatch,
      intl,
    } = this.props;
    const isAuthor = proposal.author.isViewer;
    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id='global.state' />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.proposal.state' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content box-content__status-form">
          <form onSubmit={handleSubmit}>
            {!proposal.author.isEmailConfirmed && (
              <p>
                <FormattedMessage
                  id="author-email-waiting-confirmation"
                  values={{ email: proposal.author.email }}
                />
              </p>
            )}
            <Field
              type="radio-buttons"
              id="publicationStatus"
              name="publicationStatus"
              component={component}
              disabled={
                !isSuperAdmin &&
                (publicationStatus === 'DELETED' || publicationStatus === 'UNPUBLISHED')
              }>
              {isAuthor && (
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'publicationStatus', 'DRAFT'))}
                  value="DRAFT">
                  <FormattedMessage id="proposal.state.draft" />
                </ToggleButton>
              )}
              <ToggleButton
                onClick={() => dispatch(change(formName, 'publicationStatus', 'PUBLISHED'))}
                value="PUBLISHED">
                <FormattedMessage id='global.published' />
              </ToggleButton>
              <ToggleButton
                id="proposal-trashed-tab"
                onClick={() => dispatch(change(formName, 'publicationStatus', 'TRASHED'))}
                value="TRASHED">
                <FormattedMessage id='project.trash' />
              </ToggleButton>
              <ToggleButton
                onClick={() =>
                  dispatch(change(formName, 'publicationStatus', 'TRASHED_NOT_VISIBLE'))
                }
                value="TRASHED_NOT_VISIBLE">
                <FormattedMessage id="proposal.state.hidden_content" />
              </ToggleButton>
              {publicationStatus === 'UNPUBLISHED' && (
                <ToggleButton value="UNPUBLISHED">
                  <FormattedMessage id="proposal.state.unpublished" />
                </ToggleButton>
              )}
              {publicationStatus === 'DELETED' && (
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'publicationStatus', 'DELETED'))}
                  value="DELETED">
                  <FormattedMessage id='global.deleted' />
                </ToggleButton>
              )}
            </Field>
            {(publicationStatus === 'TRASHED' || publicationStatus === 'TRASHED_NOT_VISIBLE') && (
              <div>
                <Field
                  id="trashedReason"
                  name="trashedReason"
                  label="Motif de la modération (facultatif)"
                  type="textarea"
                  component={component}
                />
              </div>
            )}
            {proposal.deletedAt && <p>Supprimé le {moment(proposal.deletedAt).format('ll')}</p>}
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={pristine || invalid || submitting}
                type="submit"
                bsStyle="primary"
                id="proposal-change-state">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              {(isSuperAdmin || isAuthor) && !proposal.deletedAt && (
                <Button
                  bsStyle="danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        intl.formatMessage({ id: 'proposal.admin.status.delete.confirmation' }),
                      )
                    ) {
                      onDelete(proposal.id);
                    }
                  }}>
                  <FormattedMessage id="global.delete" />
                </Button>
              )}
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
    );
  }
}
const componentIntl = injectIntl(ProposalAdminStatusForm);
const form = reduxForm({
  enableReinitialize: true,
  form: formName,
})(componentIntl);

const mapStateToProps = (state: State, { proposal }: RelayProps) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  onSubmit,
  initialValues: {
    publicationStatus: proposal.publicationStatus,
    trashedReason: proposal.trashedReason,
  },
  publicationStatus: formValueSelector(formName)(state, 'publicationStatus'),
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminStatusForm_proposal on Proposal {
      id
      publicationStatus
      trashedReason
      deletedAt
      author {
        id
        isEmailConfirmed
        email
        isViewer
      }
    }
  `,
});
