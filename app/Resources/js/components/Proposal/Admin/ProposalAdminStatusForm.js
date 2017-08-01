// @flow
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import ChangeProposalPublicationStatusMutation from '../../../mutations/ChangeProposalPublicationStatusMutation';
import type { ProposalAdminStatusForm_proposal } from './__generated__/ProposalAdminStatusForm_proposal.graphql';

type DefaultProps = void;
type Props = { proposal: ProposalAdminStatusForm_proposal, relay: Object };
type State = void;

export class ProposalAdminStatusForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  _handleCompleteChange = () => {
    ChangeProposalPublicationStatusMutation.commit(
      this.props.relay.environment,
      'TRASHED',
      this.props.proposal.id,
    );
  };

  render() {
    const { proposal } = this.props;
    if (proposal.author.expiresAt) {
      return (
        <p>
          Adresse email de l'auteur en attente de confirmation:{' '}
          {proposal.author.email}
        </p>
      );
    }
    if (
      proposal.publicationStatus === 'TRASHED' ||
      proposal.publicationStatus === 'PUBLISHED'
    ) {
      return (
        <div>
          <ButtonToolbar>
            <ButtonGroup>
              <Button>Publié</Button>
              <Button onClick={() => this._handleCompleteChange()}>
                Corbeille
              </Button>
              <Button>Expiré</Button>
            </ButtonGroup>
          </ButtonToolbar>
          {proposal.publicationStatus === 'TRASHED' &&
            <div>
              {/* <Field
                  name="trashedReason"
                  label=""
                /> */}
            </div>}
        </div>
      );
    }
    if (proposal.publicationStatus === 'EXPIRED') {
      return (
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
      );
    }
    if (proposal.publicationStatus === 'DELETED') {
      return (
        <div>
          <ButtonToolbar>
            <ButtonGroup>
              <Button>Publié</Button>
              <Button>Corbeille</Button>
              <Button>Supprimé</Button>
            </ButtonGroup>
          </ButtonToolbar>
          <p>
            Supprimé le {proposal.deletedAt}
          </p>
        </div>
      );
    }
    return (
      <div>
        <ButtonToolbar>
          <ButtonGroup>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalAdminStatusForm,
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
