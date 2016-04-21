import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';
import LoginStore from '../../stores/LoginStore';

const NewOpinionButton = React.createClass({
  propTypes: {
    slug: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { slug, link, label } = this.props;
    return (
      <LoginOverlay>
        <a
          id={'btn-add--' + slug}
          href={LoginStore.isLoggedIn() ? link : '#'}
          className="btn btn-primary"
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">{label}</span>
        </a>
      </LoginOverlay>
    );
  },

});

export default NewOpinionButton;
