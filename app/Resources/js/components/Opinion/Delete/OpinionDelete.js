// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import DeleteVersionMutation from '../../../mutations/DeleteVersionMutation';
import DeleteOpinionMutation from '../../../mutations/DeleteOpinionMutation';
import type { OpinionDelete_opinion } from '~relay/OpinionDelete_opinion.graphql';
import type { GlobalState } from '../../../types';

type Props = {
  opinion: OpinionDelete_opinion,
  user?: Object,
};

type State = {|
  showModal: boolean,
  isSubmitting: boolean,
|};

class OpinionDelete extends React.Component<Props, State> {
  static defaultProps = {
    user: null,
  };

  state = {
    showModal: false,
    isSubmitting: false,
  };

  showModal = () => {
    this.setState({ showModal: true });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  delete = () => {
    const { opinion } = this.props;
    this.setState({ isSubmitting: true });
    if (opinion.__typename === 'Version') {
      const input = { versionId: opinion.id };
      DeleteVersionMutation.commit({ input }).then(() => {
        window.location.href = opinion.section.url;
      });
    }
    if (opinion.__typename === 'Opinion') {
      const input = { opinionId: opinion.id };
      DeleteOpinionMutation.commit({ input }).then(() => {
        window.location.href = opinion.section.url;
      });
    }
  };

  isTheUserTheAuthor = () => {
    const { opinion, user } = this.props;
    if (!opinion.author || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.slug;
  };

  render() {
    if (!this.isTheUserTheAuthor()) {
      return null;
    }
    const { showModal, isSubmitting } = this.state;
    return (
      <div>
        <Button
          id="opinion-delete"
          className="pull-right btn--outline btn-danger"
          onClick={this.showModal}
          style={{ marginLeft: '5px' }}>
          <i className="cap cap-bin-2" /> {<FormattedMessage id="global.delete" />}
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={this.hideModal}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="global.removeMessage" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <FormattedHTMLMessage id="proposal.delete.confirm" />
            </p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.hideModal} />
            <SubmitButton
              id="confirm-opinion-delete"
              isSubmitting={isSubmitting}
              onSubmit={this.delete}
              label="global.removeDefinitively"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  user: state.user.user,
});

const container = connect(mapStateToProps)(OpinionDelete);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionDelete_opinion on OpinionOrVersion {
      ... on Opinion {
        __typename
        id
        author {
          slug
        }
        section {
          url
        }
      }
      ... on Version {
        __typename
        id
        author {
          slug
        }
        section {
          url
        }
      }
    }
  `,
});
