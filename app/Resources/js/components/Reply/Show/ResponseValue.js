import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';

const ResponseValue = React.createClass({
  propTypes: {
    response: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { response } = this.props;
    if (!response.value || (Array.isArray(response.value) && !response.value.length)) {
      return <p>{this.getIntlMessage('reply.show.response.no_value')}</p>;
    }
    if (response.field.type === 'editor') {
      return <p><FormattedHTMLMessage message={response.value} /></p>;
    }
    if (response.field.type === 'ranking') {
      return response.value.labels.length > 0
        ? <ol>
          {
            response.value.labels.map((label, index) => {
              return <li key={index}>{label}</li>;
            })
          }
        </ol>
        : <p>{this.getIntlMessage('reply.show.response.no_value')}</p>
      ;
    }
    if (typeof response.value === 'object') {
      const labels = response.value.labels;
      if (response.value.other) {
        labels.push(response.value.other);
      }
      return labels.length > 0
        ? <p>{labels.join(', ')}</p>
        : <p>{this.getIntlMessage('reply.show.response.no_value')}</p>
      ;
    }
    return <p>{response.value}</p>;
  },

});

export default ResponseValue;
