import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const ProjectTrashButton = React.createClass({
  propTypes: {
    link: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
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
    const { link, label, user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <a
          id="trash-link"
          href={user !== null ? link : null}
          style={{ display: 'block', borderColor: 'transparent !important' }}
        >
          <p className="navbar__step-title">
              <i className="cap cap-bin-2-1" />
              { label } <i className="pull-right excerpt cap-arrow-66" />
          </p>
        </a>
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

export default connect(mapStateToProps)(ProjectTrashButton);
