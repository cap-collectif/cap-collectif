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
    return (
      <div className="container container--custom">
        {
          description
          ? <FormattedHTMLMessage message={description} />
          : null
        }
      </div>
    );
  },

});

export default IdeasIndexHeader;
