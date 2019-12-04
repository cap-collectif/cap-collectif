import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { hashHistory } from 'react-router';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';

class IgnoreButton extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
    element: PropTypes.object,
  };

  state = {
    showConfirmModal: false,
  };

  componentWillUnmount() {
    this.hideConfirmModal();
  }

  showConfirmModal = () => {
    this.setState({
      showConfirmModal: true,
    });
  };

  hideConfirmModal = () => {
    this.setState({
      showConfirmModal: false,
    });
  };

  ignore = () => {
    const { element, synthesis } = this.props;
    this.hideConfirmModal();
    const data = {
      archived: true,
      published: false,
    };
    SynthesisElementActions.update(synthesis.id, element.id, data);
    hashHistory.push('inbox', { type: 'new' });
  };

  renderConfirmButton = () => {
    return (
      <Button
        bsSize="large"
        type="button"
        className="element__action-ignore"
        onClick={this.showConfirmModal}>
        <i className="cap cap-delete-2" />
      </Button>
    );
  };

  renderConfirmModal = () => {
    const { element } = this.props;
    return (
      <Modal
        show={this.state.showConfirmModal}
        onHide={this.hideConfirmModal}
        animation={false}
        dialogClassName="modal--confirm">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="synthesis.edition.action.confirm_ignore.title"
              values={{
                name: element.title,
              }}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {<FormattedMessage id="synthesis.edition.action.confirm_ignore.body" />}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" className="modal--confirm__cancel" onClick={this.hideConfirmModal}>
            {<FormattedMessage id='global.cancel' />}
          </Button>
          <Button
            className="modal--confirm__submit"
            bsStyle="primary"
            type="submit"
            onClick={this.ignore}>
            {<FormattedMessage id='global.ignore' />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  render() {
    return (
      <div className="element__action">
        {this.renderConfirmButton()}
        {this.renderConfirmModal()}
      </div>
    );
  }
}

export default IgnoreButton;
