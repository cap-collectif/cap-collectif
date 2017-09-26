// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ToggleButton, Button, ButtonToolbar } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import moment from 'moment';
import component from '../../Form/Field';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import DeleteProposalMutation from '../../../mutations/DeleteProposalMutation';
import type { ProposalAdminStatusForm_proposal } from './__generated__/ProposalAdminStatusForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type DefaultProps = void;
type RelayProps = { proposal: ProposalAdminStatusForm_proposal };
type Props = RelayProps & {
  publicationStatus: string,
  isSuperAdmin: boolean,
  isAuthor: boolean,
  pristine: boolean,
  invalid: boolean,
  submitting: boolean,
  dispatch: Dispatch,
  handleSubmit: () => void,
};
type FormValues = {
  publicationStatus: 'PUBLISHED' | 'TRASHED' | 'TRASHED_NOT_VISIBLE',
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
  }).then(() => {
    location.reload();
  });
};

const onDelete = (proposalId: string) => {
  return DeleteProposalMutation.commit({
    input: {
      proposalId,
    },
  }).then(location.reload());
};

export class ProposalAdminStatusForm extends Component<Props, void> {
  static defaultProps: DefaultProps;
  render() {
    const {
      isSuperAdmin,
      isAuthor,
      proposal,
      pristine,
      invalid,
      submitting,
      handleSubmit,
      publicationStatus,
      dispatch,
    } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.admin.state" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#publication">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            {proposal.author.expiresAt && (
              <p>Adresse email de l'auteur en attente de confirmation: {proposal.author.email}</p>
            )}
            <Field
              type="radio-buttons"
              id="publicationStatus"
              name="publicationStatus"
              component={component}
              disabled={
                !isSuperAdmin &&
                (publicationStatus === 'DELETED' || publicationStatus === 'EXPIRED')
              }>
              <ToggleButton
                onClick={() => dispatch(change(formName, 'publicationStatus', 'PUBLISHED'))}
                value="PUBLISHED">
                Publié
              </ToggleButton>
              <ToggleButton
                onClick={() => dispatch(change(formName, 'publicationStatus', 'TRASHED'))}
                value="TRASHED">
                Corbeille
              </ToggleButton>
              <ToggleButton
                onClick={() =>
                  dispatch(change(formName, 'publicationStatus', 'TRASHED_NOT_VISIBLE'))}
                value="TRASHED_NOT_VISIBLE">
                Corbeille (contenu masqué)
              </ToggleButton>
              {publicationStatus === 'EXPIRED' && (
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'publicationStatus', 'EXPIRED'))}
                  value="EXPIRED">
                  Expiré
                </ToggleButton>
              )}
              {publicationStatus === 'DELETED' && (
                <ToggleButton
                  onClick={() => dispatch(change(formName, 'publicationStatus', 'DELETED'))}
                  value="DELETED">
                  Supprimé
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
            <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
              <Button disabled={pristine || invalid || submitting} type="submit" bsStyle="primary">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              {(isSuperAdmin || isAuthor) &&
              !proposal.deletedAt && (
                <Button bsStyle="danger" onClick={() => onDelete(proposal.id)}>
                  <FormattedMessage id="global.delete" />
                </Button>
              )}
            </ButtonToolbar>
          </form>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  form: formName,
})(ProposalAdminStatusForm);

const mapStateToProps = (state: State, { proposal }: RelayProps) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  isAuthor: !!(state.user.user && state.user.user.id === proposal.author.id),
  onSubmit,
  initialValues: {
    publicationStatus: proposal.publicationStatus,
    trashedReason: proposal.trashedReason,
  },
  publicationStatus: formValueSelector(formName)(state, 'publicationStatus'),
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminStatusForm_proposal on Proposal {
      id
      publicationStatus
      trashedReason
      deletedAt
      author {
        id
        expiresAt
        email
      }
    }
  `,
);
