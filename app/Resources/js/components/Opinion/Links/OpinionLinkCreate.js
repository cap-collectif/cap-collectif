// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import { Modal } from 'react-bootstrap';
import OpinionLinkCreateButton from './OpinionLinkCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import OpinionLinkCreateInfos from './OpinionLinkCreateInfos';
import OpinionLinkCreateForm, {
  formName,
} from './../Form/OpinionLinkCreateForm';
import OpinionTypeActions from '../../../actions/OpinionTypeActions';

const OpinionLinkCreate = React.createClass({
  propTypes: {
    submitting: React.PropTypes.bool.isRequired,
    opinion: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      showModal: false,
      availableTypes: [],
    };
  },

  componentDidMount() {
    const { opinion } = this.props;
    OpinionTypeActions.getAvailableTypes(
      opinion.type.id,
    ).then(availableTypes => {
      this.setState({ availableTypes });
    });
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  handleSubmitSuccess() {
    this.close();
    this.setState({ isSubmitting: false });
    window.location.reload();
  },

  render() {
    const { submitting, opinion, dispatch } = this.props;
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
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {<FormattedMessage id="opinion.link.add_new" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OpinionLinkCreateInfos opinion={opinion} />
            {this.state.availableTypes.length > 0 &&
              <OpinionLinkCreateForm
                opinion={opinion}
                availableTypes={this.state.availableTypes}
              />}
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="confirm-opinion-link-create"
              isSubmitting={submitting}
              onSubmit={() => {
                dispatch(submit(formName));
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
});

export default connect(state => ({
  submitting: isSubmitting(formName)(state),
}))(OpinionLinkCreate);
