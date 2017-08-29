// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import OpinionSource from './OpinionSource';

const OpinionSourceList = React.createClass({
  propTypes: {
    sources: React.PropTypes.array.isRequired,
  },

  render() {
    const { sources } = this.props;
    if (sources.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1" />
          <br />
          {<FormattedMessage id="opinion.no_new_source" />}
        </p>
      );
    }

    return (
      <ul
        id="sources-list"
        className="media-list"
        style={{ marginTop: '20px' }}>
        {sources.map(source => {
          return (
            <OpinionSource {...this.props} key={source.id} source={source} />
          );
        })}
      </ul>
    );
  },
});

export default OpinionSourceList;
