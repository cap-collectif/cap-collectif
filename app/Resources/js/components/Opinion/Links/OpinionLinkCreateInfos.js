// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const OpinionLinkCreateInfos = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },

  render() {
    const { opinion } = this.props;
    return (
      <div>
        <div className="modal-top bg-info">
          <p>
            {<FormattedMessage id="opinion.link.infos" />}
          </p>
        </div>
        <p>
          {<FormattedMessage id="opinion.link.info" />}{' '}
          <a href={opinion._links.show}>{opinion.title}</a>
        </p>
      </div>
    );
  },
});

export default OpinionLinkCreateInfos;
