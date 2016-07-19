import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import OpinionActions from '../../../actions/OpinionActions';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { connect } from 'react-redux';

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
    return !!this.props.opinion.parent;
  },

  delete() {
    this.setState({ isSubmitting: true });
    if (this.isVersion()) {
      OpinionActions.deleteVersion(this.props.opinion.id, this.props.opinion.parent.id)
        .then(() => {
          window.location.href = this.props.opinion._links.parent;
        })
      ;
    } else {
      OpinionActions.deleteOpinion(this.props.opinion.id)
        .then(() => {
          window.location.href = this.props.opinion._links.type;
        })
      ;
    }
  },

  isTheUserTheAuthor() {
    if (this.props.opinion.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.opinion.author.uniqueId;
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
            style={{ marginLeft: '5px' }}
          >
            <i className="cap cap-bin-2"></i> {this.getIntlMessage('global.remove')}
          </Button>
          <Modal
            animation={false}
            show={showModal}
            onHide={this.hideModal}
            bsSize="large"
            aria-labelledby="contained-modal-title-lg"
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">
                { this.getIntlMessage('global.remove') }
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <FormattedMessage
                  message={this.getIntlMessage('opinion.delete.confirm')}
                  title={this.props.opinion.title}
                />
              </p>
            </Modal.Body>
            <Modal.Footer>
              <CloseButton onClose={this.hideModal} />
              <SubmitButton
                id="confirm-opinion-delete"
                isSubmitting={isSubmitting}
                onSubmit={this.delete}
                label="global.remove"
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

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(OpinionDelete);
