import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const ResponseValue = React.createClass({
  propTypes: {
    response: PropTypes.object.isRequired,
  },

  render() {
    const { response } = this.props;

    if (
      !response.value ||
      (Array.isArray(response.value) && !response.value.length) ||
      (typeof response.value === 'object' && response.value.labels)
    ) {
      return <p>{<FormattedMessage id="reply.show.response.no_value" />}</p>;
    }
    if (response.field.type === 'editor') {
      return (
        <p>
          <div dangerouslySetInnerHTML={{ __html: response.value }} />
        </p>
      );
    }
    if (response.field.type === 'ranking') {
      return response.value.labels.length > 0 ? (
        <ol>
          {response.value.labels.map((label, index) => {
            return <li key={index}>{label}</li>;
          })}
        </ol>
      ) : (
        <p>
          <FormattedMessage id="reply.show.response.no_value" />
        </p>
      );
    }
    if (typeof response.value === 'object') {
      const labels = response.value.labels;
      if (response.value.other) {
        labels.push(response.value.other);
      }
      return labels.length > 0 ? (
        <p>{labels.join(', ')}</p>
      ) : (
        <p>{<FormattedMessage id="reply.show.response.no_value" />}</p>
      );
    }
    return <p>{response.value}</p>;
  },
});

export default ResponseValue;
