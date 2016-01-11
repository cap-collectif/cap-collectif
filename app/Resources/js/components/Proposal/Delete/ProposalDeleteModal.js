import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalActions from '../../../actions/ProposalActions';

const Modal = ReactBootstrap.Modal;
const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalDeleteModal = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    proposal: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({isSubmitting: true});
    ProposalActions
      .delete(this.props.form.id, this.props.proposal.id)
      .then(() => {
        window.location.href = this.props.proposal._links.index;
      })
      .catch(() => {
        this.setState({isSubmitting: false});
      })
    ;
  },

  close() {
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  render() {
    return (
      <div>
        <Modal
          animation={false}
          show={this.props.show}
          onHide={this.close.bind(null, this)}
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
                message={this.getIntlMessage('proposal.delete.confirm')}
                title={this.props.proposal.title}
              />
            </p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close.bind(null, this)} />
            <SubmitButton
              id="confirm-proposal-delete"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit.bind(null, this)}
              label="global.remove"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProposalDeleteModal;
