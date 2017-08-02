// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { ToggleButton } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import type { ProposalAdminStatusForm_proposal } from './__generated__/ProposalAdminStatusForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminStatusForm_proposal,
  relay: Object,
  publicationStatus: string,
};
type State = void;

const formName = 'proposal-admin-status';
const onSubmit = (values, dispatch, props) => {
  ChangeProposalPublicationStatusMutation.commit(
    props.relay.environment,
    'TRASHED',
    props.proposal.id,
  );
};

export class ProposalAdminStatusForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    const { proposal, publicationStatus } = this.props;
    return (
      <form>
        <a href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#publication">
          Aide
        </a>
        {proposal.author.expiresAt &&
          <p>
            Adresse email de l'auteur en attente de confirmation:{' '}
            {proposal.author.email}
          </p>}
        {(publicationStatus === 'TRASHED' ||
          publicationStatus === 'PUBLISHED') &&
          <div>
            <Field type="radio-buttons" name="publicationStatus">
              <ToggleButton value={1}>Publié</ToggleButton>
              <ToggleButton value={2}>Corbeille</ToggleButton>
            </Field>
            {publicationStatus === 'TRASHED' &&
              <div>
                <Field
                  name="trashedReason"
                  label="Motif de la modération (facultatif)"
                  type="textarea"
                />
              </div>}
            }
          </div>}
        {/* {
          publicationStatus === 'EXPIRED' &&
          <div>
            <ButtonToolbar>
              <ButtonGroup>
                <Button>Publié</Button>
                <Button>Corbeille</Button>
                <Button>Expiré</Button>
              </ButtonGroup>
            </ButtonToolbar>
            <p>La proposition a expiré.</p>
          </div>
        } */}
        {/* {
            proposal.publicationStatus === 'DELETED'  &&
        } */}
      </form>
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
