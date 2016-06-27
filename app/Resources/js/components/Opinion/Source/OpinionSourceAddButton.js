import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { connect } from 'react-redux';

const OpinionSourceAddButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      disabled: false,
    };
  },

  render() {
    const { user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button
          id="source-form__add"
          disabled={this.props.disabled}
          bsStyle="primary"
          onClick={user && !this.props.disabled ? this.props.handleClick : null}
        >
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.add_new_source')}
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.features,
    user: state.user,
  };
};

export default connect(mapStateToProps)(OpinionSourceAddButton);
