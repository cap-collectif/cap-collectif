import React from 'react';
import { FormattedHTMLMessage, IntlMixin } from 'react-intl';
import ProposalPrivateField from '../ProposalPrivateField';

const ProposalResponse = React.createClass({
  propTypes: {
    response: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  isHTML() {
    const { response } = this.props;
    return /<[a-z][\s\S]*>/i.test(response.value);
  },

  render() {
    const response = this.props.response;
    if (!response.value || response.value.length === 0) {
      return null;
    }
    const value = (
      <div>
        <h2 className="h2">{ response.field.question }</h2>
        {
          this.isHTML()
          ? <FormattedHTMLMessage message={response.value} />
          : <p>{response.value}</p>
        }
      </div>
    );
    return (
      <ProposalPrivateField
        show={response.field.private}
        children={value}
        divClassName="block"
      />
    );
  },

});

export default ProposalResponse;
