import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';

const ProposalResponse = React.createClass({
  propTypes: {
    response: React.PropTypes.object.isRequired,
  },

  isHTML() {
    const { response } = this.props;
    return /<[a-z][\s\S]*>/i.test(response.value);
  },

  render() {
    const response = this.props.response;
    if (!response.value || response.value.length === 0) {
      return null;
    }
    return (
      <div className="block">
        <h2 className="h2">{ response.field.question }</h2>
        {
          this.isHTML()
          ? <FormattedHTMLMessage message={response.value} />
          : <p>{response.value}</p>
        }
      </div>
    );
  },

});

export default ProposalResponse;
