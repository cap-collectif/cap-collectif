import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ElementsList from './../List/ElementsList';
import Loader from '../../Utils/Loader';

const ChildrenModal = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    show: React.PropTypes.bool.isRequired,
    toggle: React.PropTypes.func.isRequired
  },

  getInitialState() {
    const { elements } = this.props;
    return {
      isLoading: elements.length === 0
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      isLoading: nextProps.elements.length === 0
    });
  },

  show() {
    const { toggle } = this.props;
    toggle(true);
  },

  hide() {
    const { toggle } = this.props;
    toggle(false);
  },

  render() {
    const { elements, show } = this.props;
    return (
      <Modal show={show} onHide={this.hide} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{<FormattedMessage id="synthesis.view.childrenModal.title" />}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Loader show={this.state.isLoading}>
            <ElementsList
              elements={elements}
              showBreadcrumb={false}
              showStatus={false}
              showNotation={false}
              hasLink
              linkType="original"
            />
          </Loader>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" bsStyle="primary" onClick={this.hide}>
            {<FormattedMessage id="synthesis.view.childrenModal.close" />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

export default ChildrenModal;
