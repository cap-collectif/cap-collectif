import React from 'react';
import ElementsList from './../List/ElementsList';
import Loader from '../../Utils/Loader';
import { Modal, Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

const ChildrenModal = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    show: React.PropTypes.bool.isRequired,
    toggle: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isLoading: this.props.elements.length === 0,
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      isLoading: nextProps.elements.length === 0,
    });
  },

  show() {
    this.props.toggle(true);
  },

  hide() {
    this.props.toggle(false);
  },

  render() {
    return (
    <Modal show={this.props.show} onHide={this.hide} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{this.getIntlMessage('synthesis.view.childrenModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Loader show={this.state.isLoading}>
          <ElementsList
            elements={this.props.elements}
            showBreadcrumb={false}
            showStatus={false}
            showNotation={false}
            hasLink
            linkType="original"
          />
        </Loader>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" bsStyle="primary" onClick={this.hide}>{this.getIntlMessage('synthesis.view.childrenModal.close')}</Button>
      </Modal.Footer>
    </Modal>
    );
  },

});

export default ChildrenModal;
