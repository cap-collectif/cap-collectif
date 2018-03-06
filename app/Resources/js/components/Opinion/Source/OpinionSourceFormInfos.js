// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const OpinionSourceFormInfos = React.createClass({
  propTypes: {
    action: PropTypes.string.isRequired
  },

  render() {
    const { action } = this.props;
    if (action === 'update') {
      return null;
    }

    return (
      <div className="modal-top bg-info">
        <p>{<FormattedMessage id="source.add_infos" />}</p>
      </div>
    );
  }
});

export default OpinionSourceFormInfos;
