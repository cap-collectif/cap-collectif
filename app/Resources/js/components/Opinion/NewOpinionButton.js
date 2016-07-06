import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const NewOpinionButton = React.createClass({
  propTypes: {
    slug: PropTypes.string.isRequired,
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
    const { slug, link, label, user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <a
          id={'btn-add--' + slug}
          href={user ? link : null}
          className="btn btn-primary"
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">{label}</span>
        </a>
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

export default connect(mapStateToProps)(NewOpinionButton);
