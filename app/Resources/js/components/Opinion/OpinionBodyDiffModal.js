import React from 'react';
import {IntlMixin} from 'react-intl';
import {Modal, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';

import CustomDiff from '../../services/CustomDiff';

const OpinionBodyDiffModal = React.createClass({
  propTypes: {
    link: React.PropTypes.string.isRequired,
    modal: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return { showModal: false };
  },

  open() {
    this.setState({ showModal: true });
  },

  close() {
    this.setState({ showModal: false });
  },

  render() {
    return (
      <span>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip placement="top" className="in">
              {this.getIntlMessage('opinion.diff.tooltip')}
            </Tooltip>
          }
        >
          <a onClick={() => this.open()}>
            {this.props.link}
          </a>
        </OverlayTrigger>
        <Modal show={this.state.showModal} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modal.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <b>{this.getIntlMessage('opinion.diff.title')}</b>
            <p className="small excerpt">
              {this.getIntlMessage('opinion.diff.infos')}
            </p>
            <div dangerouslySetInnerHTML={{__html: this.props.modal.diff }} />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={() => this.close()}>{this.getIntlMessage('global.close')}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

});

export default OpinionBodyDiffModal;
