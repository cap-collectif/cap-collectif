// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ToggleButton, Button, ButtonToolbar } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import component from '../../Form/Field';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import DeleteProposalMutation from '../../../mutations/DeleteProposalMutation';
import type { ProposalAdminStatusForm_proposal } from './__generated__/ProposalAdminStatusForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminStatusForm_proposal,
  publicationStatus: string,
  handleSubmit: () => void,
};
type State = void;

const formName = 'proposal-admin-status';
const onSubmit = (values, dispatch, props) => {
  ChangeProposalPublicationStatusMutation.commit({
    input: {
      publicationStatus: values.publicationStatus,
      id: props.proposal.id,
    },
  }).then(location.reload());
};

const onDelete = proposalId => {
  DeleteProposalMutation.commit({
    input: {
      proposalId,
    },
  }).then(location.reload());
};

export class ProposalAdminStatusForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    const { proposal, handleSubmit, publicationStatus } = this.props;
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
              publicationStatus === 'DELETED' || publicationStatus === 'EXPIRED'
            }>
            <ToggleButton value="PUBLISHED">Publié</ToggleButton>
            <ToggleButton value="TRASHED">Corbeille</ToggleButton>
            {publicationStatus === 'EXPIRED' &&
              <ToggleButton value="EXPIRED">Expiré</ToggleButton>}
            {publicationStatus === 'DELETED' &&
              <ToggleButton value="DELETED">Supprimé</ToggleButton>}
          </Field>
          {publicationStatus === 'TRASHED' &&
            <div>
              <Field
                id="trashedReason"
                name="trashedReason"
                label="Motif de la modération (facultatif)"
                type="textarea"
                component={component}
              />
            </div>}
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button type="submit" bsStyle="primary">
              <FormattedMessage id="global.save" />
            </Button>
            <Button bsStyle="danger" onClick={() => onDelete(proposal.id)}>
              <FormattedMessage id="global.delete" />
            </Button>
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  form: formName,
})(ProposalAdminStatusForm);

const mapStateToProps = (state, { proposal }) => ({
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
      deletedAt
      author {
        expiresAt
        email
      }
    }
  `,
);
