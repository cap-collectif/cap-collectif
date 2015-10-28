import ElementsList from './ElementsList';

const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;

const ChildrenModal = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    show: React.PropTypes.bool.isRequired,
    toggle: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

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
        <Modal.Title>{this.getIntlMessage('view.childrenModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ElementsList
          elements={this.props.elements}
          showBreadcrumb={false}
          showStatus={false}
          showNotation={false}
          hasLink={false}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" bsStyle="primary" onClick={this.hide.bind(null, this)}>{this.getIntlMessage('view.childrenModal.close')}</Button>
      </Modal.Footer>
    </Modal>
    );
  },

});

export default ChildrenModal;
