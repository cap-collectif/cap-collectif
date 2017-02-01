import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import ViewTree from './View/ViewTree';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  render() {
    const {
      synthesis,
      user,
    } = this.props;
    if (synthesis.enabled || (user && user.vip)) {
      return (
        <div className="synthesis__view">
          <ViewTree synthesis={synthesis} />
        </div>
      );
    }
    return null;
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ViewBox);
