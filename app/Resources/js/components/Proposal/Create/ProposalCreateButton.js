import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  onClick() {
    if (!this.props.disabled && this.props.user) {
      this.props.handleClick();
    }
  },

  render() {
    const { user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button id="add-proposal" disabled={this.props.disabled} bsStyle="primary" onClick={() => this.onClick()}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('proposal.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalCreateButton);
