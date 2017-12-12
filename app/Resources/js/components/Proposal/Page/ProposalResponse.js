// @flow
import * as React from 'react';
import ProposalPrivateField from '../ProposalPrivateField';
import ProposalMediaResponse from '../Page/ProposalMediaResponse';

type Props = {
  response: Object,
};

class ProposalResponse extends React.Component<Props> {
  isHTML = () => {
    const { response } = this.props;
    return /<[a-z][\s\S]*>/i.test(response.value);
  };

  render() {
    const response = this.props.response;
    let value = '';
    if ((!response.value || response.value.length === 0) && response.field.type !== 'medias') {
      return null;
    }
    if (response.field.type === 'medias') {
      value = (
        <div>
          <h3 className="h3">{response.field.question}</h3>
          <ProposalMediaResponse medias={response.medias} />
        </div>
      );
    } else {
      value = (
        <div>
          <h3 className="h3">{response.field.question}</h3>
          {this.isHTML() ? (
            <div dangerouslySetInnerHTML={{ __html: response.value }} />
          ) : (
            <p>{response.value}</p>
          )}
        </div>
      );
    }

    return (
      <ProposalPrivateField show={response.field.private} children={value} divClassName="block" />
    );
  }
}

export default ProposalResponse;
