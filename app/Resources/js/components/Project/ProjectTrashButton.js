// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const ProjectTrashButton = React.createClass({
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
    const { link, user } = this.props;
    return (
      <div className="container container--custom text-center">
        <div className="row">
          <h3 className="mt-0">
            <FormattedMessage id="project.show.trashed.short_name" />
          </h3>
          <p className="excerpt">
            <FormattedMessage id="project.show.trashed.text" />
          </p>
          <LoginOverlay>
            <a
              id="trash-link"
              href={user ? link : null}
              style={{ display: 'block', borderColor: 'transparent !important' }}>
              <p>
                <FormattedMessage id="project.show.trashed.display" />
                {/* {label} */}
              </p>
            </a>
          </LoginOverlay>
        </div>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ProjectTrashButton);
