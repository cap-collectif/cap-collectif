import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const NewOpinionButton = React.createClass({
  propTypes: {
    opinionType: PropTypes.object.isRequired,
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

  render() {
    const { user, features, opinionType } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <a
          id={'btn-add--' + opinionType.slug}
          onClick={user ? this.openModal : null}
          className="btn btn-primary"
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">Creation</span>
        </a>
        <OpinionCreateModal opinionType={opinionType} show={this.state.modal} />
      </LoginOverlay>
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
