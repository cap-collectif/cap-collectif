// @flow
import * as React from 'react';

const IdeasIndexHeader = React.createClass({
  propTypes: {
    description: React.PropTypes.string
  },

  render() {
    const { description } = this.props;
    return (
      <div
        className="container container--custom"
        style={{ display: description ? 'block' : 'none' }}>
        {description && <div dangerouslySetInnerHTML={{ __html: description }} />}
      </div>
    );
  }
});

export default IdeasIndexHeader;
