import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const NewIdeaButton = React.createClass({
  propTypes: {
    link: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    user: PropTypes.object,
  },

  getDefaultProps() {
    return {
      user: null,
    };
  },

  render() {
    const { link, user, label } = this.props;
    return (
      <LoginOverlay>
        <div className="col-xs-12  col-sm-3  col-md-3  col-lg-2  filter__down">
          <a href={user ? link : null} className="form-control  btn  btn-primary">
            <i className="cap cap-add-1" /> {label}
          </a>
        </div>
      </LoginOverlay>
    );
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(NewIdeaButton);
