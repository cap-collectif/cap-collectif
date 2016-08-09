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
    const { synthesis } = this.props;
    return (
      <div className="synthesis__view" style={{ paddingTop: '30px' }}>
        <ViewTree synthesis={synthesis} />
      </div>
    );
  },

});

export default Preview;
