import React from 'react';
import { IntlMixin } from 'react-intl';
import ViewTree from './ViewTree';

const Preview = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      synthesis: {},
    };
  },

  render() {
    return (
      <div className="synthesis__view" style={{ paddingTop: '30px' }}>
        <ViewTree synthesis={this.props.synthesis} />
      </div>
    );
  },

});

export default Preview;
