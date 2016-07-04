import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';

const NewOpinionButton = React.createClass({
  propTypes: {
    opinionTypeSlug: PropTypes.string.isRequired,
    opinionTypeId: PropTypes.number.isRequired,
    stepId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

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
    const { user, features, opinionTypeSlug, opinionTypeId, projectId, stepId } = this.props;
    return (
      <span>
      <LoginOverlay user={user} features={features}>
        <a
          id={'btn-add--' + opinionTypeSlug}
          onClick={user ? this.openModal : null}
          className="btn btn-primary"
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">Creation</span>
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

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(NewOpinionButton);
