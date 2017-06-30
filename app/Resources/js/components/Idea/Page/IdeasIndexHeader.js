// @flow
import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';

const IdeasIndexHeader = React.createClass({
  propTypes: {
    description: React.PropTypes.string,
  },

  render() {
    const { description } = this.props;
    return (
      <div
        className="container container--custom"
        style={{ display: description ? 'block' : 'none' }}>
        {description && <FormattedHTMLMessage message={description} />}
      </div>
    );
  },
});

export default IdeasIndexHeader;
