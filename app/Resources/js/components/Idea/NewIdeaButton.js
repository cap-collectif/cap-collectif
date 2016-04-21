import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../Utils/LoginOverlay';
import LoginStore from '../../stores/LoginStore';

const NewIdeaButton = React.createClass({
  propTypes: {
    link: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { link, label } = this.props;
    return (
      <LoginOverlay>
        <div className="col-xs-12  col-sm-3  col-md-3  col-lg-2  filter__down">
            <a
              href={LoginStore.isLoggedIn() ? link : '#'}
              className="form-control  btn  btn-primary"><i className="cap cap-add-1"></i> {label}
            </a>
        </div>
      </LoginOverlay>
    );
  },

});

export default NewIdeaButton;
