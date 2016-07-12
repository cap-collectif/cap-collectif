import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';

const NewOpinionButton = React.createClass({
  propTypes: {
    opinionTypeSlug: PropTypes.string.isRequired,
    opinionTypeId: PropTypes.number.isRequired,
    stepId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      modal: false,
    };
  },

  openModal() {
    this.setState({ modal: true });
  },

  closeModal() {
    this.setState({ modal: false });
  },

  render() {
    const { label, opinionTypeSlug, opinionTypeId, projectId, stepId } = this.props;
    return (
      <span>
      <LoginOverlay>
        <a
          id={'btn-add--' + opinionTypeSlug}
          onClick={this.openModal}
          className="btn btn-primary"
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">{label}</span>
        </a>
      </LoginOverlay>
      <OpinionCreateModal
        opinionTypeId={opinionTypeId}
        stepId={stepId}
        projectId={projectId}
        show={this.state.modal}
        onClose={this.closeModal}
      />
      </span>
    );
  },

});

export default NewOpinionButton;
