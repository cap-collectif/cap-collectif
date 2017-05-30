// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import OpinionActions from '../../../actions/OpinionActions';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

const OpinionDelete = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  getInitialState() {
    return {
      showModal: false,
      isSubmitting: false,
    };
  },

  showModal() {
    this.setState({ showModal: true });
  },

  hideModal() {
    this.setState({ showModal: false });
  },

  isVersion() {
    const { opinion } = this.props;
    return !!opinion.parent;
  },

  delete() {
    const { opinion } = this.props;
    this.setState({ isSubmitting: true });
    if (this.isVersion()) {
      OpinionActions.deleteVersion(opinion.id, opinion.parent.id).then(() => {
        window.location.href = opinion._links.parent;
      });
    } else {
      OpinionActions.deleteOpinion(opinion.id).then(() => {
        window.location.href = opinion._links.type;
      });
    }
  },

  isTheUserTheAuthor() {
    const { opinion, user } = this.props;
    if (opinion.author === null || !user) {
      return false;
    }
    return user.uniqueId === opinion.author.uniqueId;
  },

  render() {
    if (this.isTheUserTheAuthor()) {
      const { showModal, isSubmitting } = this.state;
      return (
        <div>
          <Button
            id="opinion-delete"
            className="pull-right btn--outline btn-danger"
            onClick={this.showModal}
            style={{ marginLeft: '5px' }}>
            <i className="cap cap-bin-2" />
            {' '}
            {this.getIntlMessage('global.remove')}
          </Button>
          <Modal
            animation={false}
            show={showModal}
            onHide={this.hideModal}
            bsSize="large"
            aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">
                {this.getIntlMessage('global.removeMessage')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <FormattedHTMLMessage
                  message={this.getIntlMessage('opinion.delete.confirm')}
                />
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

    return null;
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(OpinionDelete);
