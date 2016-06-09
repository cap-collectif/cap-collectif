import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

export const IdeaCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    user: PropTypes.object,
    features: PropTypes.object,
  },
  mixins: [IntlMixin],

  onClick() {
    if (this.props.user) {
      this.props.handleClick();
    }
  },

  render() {
    return (
      <LoginOverlay features={this.props.features} user={this.props.user}>
        <Button
          id="idea-create-button"
          bsStyle="primary"
          onClick={this.onClick}
          className="form-control"
        >
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('idea.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    features: state.features,
  };
};

export default connect(mapStateToProps)(IdeaCreateButton);
