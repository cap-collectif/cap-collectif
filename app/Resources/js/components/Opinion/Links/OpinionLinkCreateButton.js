import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  render() {
    const { user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button id="link-form__add" bsStyle="primary" onClick={user ? this.props.handleClick : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.link.add_new')}
        </Button>
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

export default connect(mapStateToProps)(OpinionLinkCreateButton);
