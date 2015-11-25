import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import ProposalActions from '../../../actions/ProposalActions';

const Modal = ReactBootstrap.Modal;

const ProposalCreate = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      showModal: false,
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({isSubmitting: true});
  },

  close() {
    this.setState({showModal: false});
  },

  show() {
    this.setState({showModal: true});
  },

  handleSubmitSuccess() {
    this.close();
    this.setState({isSubmitting: false});
    ProposalActions.load(this.props.form.id, 'last');
  },

  handleValidationFailure() {
    this.setState({isSubmitting: false});
  },

  handleSubmitFailure() {
    this.setState({isSubmitting: false});
  },

  render() {
    return (
      <div>
        <ProposalCreateButton disabled={!this.props.form.isContribuable} handleClick={this.show.bind(null, this)} />
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close.bind(null, this)}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('proposal.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalForm
              form={this.props.form}
              themes={this.props.themes}
              districts={this.props.districts}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleValidationFailure.bind(null, this)}
              onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
              onSubmitFailure={this.handleSubmitFailure.bind(null, this)}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close.bind(null, this)} />
            <SubmitButton
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit.bind(null, this)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProposalCreate;
