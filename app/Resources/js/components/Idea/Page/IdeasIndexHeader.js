// @flow
import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';

const IdeasIndexHeader = React.createClass({
  propTypes: {
    description: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      description: null,
    };
  },

  render() {
    const { description } = this.props;

    if (!description) return null;
    return (
      <div className="container container--custom">
        <FormattedHTMLMessage message={description} />
      </div>
    );
  },
});

export default IdeasIndexHeader;
