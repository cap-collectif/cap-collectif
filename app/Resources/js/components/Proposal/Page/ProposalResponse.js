import React from 'react';
import { FormattedHTMLMessage, IntlMixin } from 'react-intl';
import ProposalPrivateField from '../ProposalPrivateField';
import ProposalMediaResponse from '../Page/ProposalMediaResponse';

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
    let value = '';
    if ((!response.value || response.value.length === 0) && response.field.type !== 'medias') {
      return null;
    }
    if (response.field.type === 'medias') {
      value = (
        <div>
          <h4 className="h4">{ response.field.question }</h4>
          <ProposalMediaResponse medias={response.medias} />
        </div>
      );
    } else {
      value = (
        <div>
          <h4 className="h4">{ response.field.question }</h4>
          {
            this.isHTML()
              ? <FormattedHTMLMessage message={response.value} />
              : <p>{response.value}</p>
          }
        </div>
      );
    }

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
