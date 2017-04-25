import React from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import OpinionLinkCreateButton from './OpinionLinkCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import OpinionLinkCreateInfos from './OpinionLinkCreateInfos';
import OpinionLinkCreateForm from './../Form/OpinionLinkCreateForm';
import OpinionTypeActions from '../../../actions/OpinionTypeActions';
import OpinionLinkActions from '../../../actions/OpinionLinkActions';

const OpinionLinkCreate = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      showModal: false,
      isSubmitting: false,
      availableTypes: [],
    };
  },

  componentDidMount() {
    const { opinion } = this.props;
    OpinionTypeActions
      .getAvailableTypes(opinion.type.id)
      .then((availableTypes) => {
        this.setState({ availableTypes });
      });
  },

  handleFailure() {
    this.setState({ isSubmitting: false });
  },

  handleSubmit() {
    if (this.form.isValid()) {
      this.form.submit();
      this.setState({ isSubmitting: true });
    }
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  handleSubmitSuccess() {
    const { opinion } = this.props;
    this.close();
    this.setState({ isSubmitting: false });
    OpinionLinkActions.load(opinion.id, 'last');
  },

  render() {
    const { opinion } = this.props;
    if (!opinion.isContribuable) {
      return null;
    }

    return (
      <div>
        <OpinionLinkCreateButton handleClick={this.show} />
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('opinion.link.add_new') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OpinionLinkCreateInfos opinion={opinion} />
            <OpinionLinkCreateForm
              ref={c => this.form = c}
              opinion={opinion}
              availableTypes={this.state.availableTypes}
              onFailure={this.handleFailure}
              onSubmitSuccess={this.handleSubmitSuccess}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="confirm-opinion-link-create"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default OpinionLinkCreate;
