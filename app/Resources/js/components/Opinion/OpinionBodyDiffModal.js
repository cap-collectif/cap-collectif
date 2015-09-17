const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;

const OpinionBodyDiffModal = React.createClass({
  propTypes: {
    link: React.PropTypes.string.isRequired,
    old: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    actual: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],


  getInitialState() {
    return { showModal: false };
  },

  close() {
    this.setState({ showModal: false });
  },

  open() {
    this.setState({ showModal: true });
  },

  render() {
    return (
      <span>
        <a onClick={this.open.bind(null, this)}>{this.props.link}</a>
        <Modal show={this.state.showModal} onHide={this.close.bind(null, this)}>
          <Modal.Header closeButton>
            <Modal.Title>Titre</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

});

export default OpinionBodyDiffModal;
