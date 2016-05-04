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
      return <span>{this.getIntlMessage('reply.show.response.no_value')}</span>;
    }
    if (response.field.type === 'editor') {
      return <FormattedHTMLMessage message={response.value} />;
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
        : <span>{this.getIntlMessage('reply.show.response.no_value')}</span>
      ;
    }
    if (typeof response.value === 'object') {
      const labels = response.value.labels;
      if (response.value.other) {
        labels.push(response.value.other);
      }
      return labels.length > 0
        ? <span>{labels.join(', ')}</span>
        : <span>{this.getIntlMessage('reply.show.response.no_value')}</span>
      ;
    }
    return <span>{response.value}</span>;
r  },

});

export default ResponseValue;
