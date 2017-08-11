// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ToggleButton, Button, ButtonToolbar } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import moment from 'moment';
import component from '../../Form/Field';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import DeleteProposalMutation from '../../../mutations/DeleteProposalMutation';
import type { ProposalAdminStatusForm_proposal } from './__generated__/ProposalAdminStatusForm_proposal.graphql';
import type { Dispatch, State } from '../../../types';

type DefaultProps = void;
type RelayProps = { proposal: ProposalAdminStatusForm_proposal };
type Props = RelayProps & {
  isSuperAdmin: boolean,
  publicationStatus: string,
  isSuperAdmin: boolean,
  pristine: boolean,
  invalid: boolean,
  handleSubmit: () => void,
};
type FormValues = {
  publicationStatus: 'PUBLISHED' | 'TRASHED' | 'TRASHED_NOT_VISIBLE',
  trashedReason: ?string,
};

const formName = 'proposal-admin-status';
const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  ChangeProposalPublicationStatusMutation.commit({
    input: {
      publicationStatus: values.publicationStatus,
      proposalId: props.proposal.id,
    },
  }).then(() => {
    location.reload();
  });
};

const onDelete = (proposalId: string) => {
  DeleteProposalMutation.commit({
    input: {
      proposalId,
    },
  }).then(location.reload());
};

export class ProposalAdminStatusForm extends Component<
  DefaultProps,
  Props,
  void,
> {
  render() {
    const {
      isSuperAdmin,
      proposal,
      pristine,
      invalid,
      handleSubmit,
      publicationStatus,
    } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h4 className="box-title">Etat</h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#publication">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          {proposal.author.expiresAt &&
            <p>
              Adresse email de l'auteur en attente de confirmation:{' '}
              {proposal.author.email}
            </p>}
          <Field
            type="radio-buttons"
            id="publicationStatus"
            name="publicationStatus"
            component={component}
            disabled={
              !isSuperAdmin &&
              (publicationStatus === 'DELETED' ||
                publicationStatus === 'EXPIRED')
            }>
            <ToggleButton value="PUBLISHED">Publié</ToggleButton>
            <ToggleButton value="TRASHED">Corbeille</ToggleButton>
            <ToggleButton value="TRASHED_NOT_VISIBLE">
              Corbeille (contenu masqué)
            </ToggleButton>
            {publicationStatus === 'EXPIRED' &&
              <ToggleButton value="EXPIRED">Expiré</ToggleButton>}
            {publicationStatus === 'DELETED' &&
              <ToggleButton value="DELETED">Supprimé</ToggleButton>}
          </Field>
          {(publicationStatus === 'TRASHED' ||
            publicationStatus === 'TRASHED_NOT_VISIBLE') &&
            <div>
              <Field
                id="trashedReason"
                name="trashedReason"
                label="Motif de la modération (facultatif)"
                type="textarea"
                component={component}
              />
            </div>}
          {proposal.deletedAt &&
            <p>
              Supprimé le {moment(proposal.deletedAt).format('ll')}
            </p>}
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button
              disabled={pristine || invalid}
              type="submit"
              bsStyle="primary">
              <FormattedMessage id="global.save" />
            </Button>
            {isSuperAdmin &&
              <Button bsStyle="danger" onClick={() => onDelete(proposal.id)}>
                <FormattedMessage id="global.delete" />
              </Button>}
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  form: formName,
})(ProposalAdminStatusForm);

const mapStateToProps = (state: State, { proposal }: RelayProps) => ({
  isSuperAdmin: !!(
    state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')
  ),
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
        expiresAt
        email
      }
    }
  `,
);
