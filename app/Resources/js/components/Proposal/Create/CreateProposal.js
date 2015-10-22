import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalCreateInfos from './ProposalCreateInfos';
import ProposalForm from './ProposalForm';
import ProposalActions from '../../../actions/ProposalActions';

const Modal = ReactBootstrap.Modal;

const ProposalCreate = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      showModal: false,
      isSubmitting: false,
      availableTypes: [],
    };
  },

  handleFailure() {
    this.setState({isSubmitting: false});
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
    ProposalActions.load(this.props.opinion.id, 'last');
  },

  render() {
    if (!this.props.opinion.isContribuable) {
      return null;
    }

    return (
      <div>
        <ProposalCreateButton handleClick={this.show.bind(null, this)} />
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close.bind(null, this)}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('source.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalCreateInfos opinion={this.props.opinion} />
            <ProposalForm
              opinion={this.props.opinion}
              availableTypes={this.state.availableTypes}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleFailure.bind(null, this)}
              onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
              onSubmitFailure={this.handleFailure.bind(null, this)}
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
