// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalPrivateField from '../ProposalPrivateField';
import ProposalMediaResponse from '../Page/ProposalMediaResponse';
import TitleInvertContrast from '../../Ui/TitleInvertContrast';
import type { ProposalResponse_response } from './__generated__/ProposalResponse_response.graphql';

type Props = {
  response: ProposalResponse_response,
};

class ProposalResponse extends React.PureComponent<Props> {
  isHTML = () => {
    const { response } = this.props;
    return response.value && /<[a-z][\s\S]*>/i.test(response.value);
  };

  render() {
    const response = this.props.response;
    let value = '';

    if (response.question.type === 'section') {
      return (
        <div>
          <TitleInvertContrast>{response.question.title}</TitleInvertContrast>
        </div>
      );
    }

    if ((!response.value || response.value.length === 0) && response.question.type !== 'medias') {
      return null;
    }
    if (response.question.type === 'medias') {
      value = (
        <div>
          <h3 className="h3">{response.question.title}</h3>
          {/* $FlowFixMe */}
          <ProposalMediaResponse medias={response.medias} />
        </div>
      );
    } else {
      value = (
        <div>
          <h3 className="h3">{response.question.title}</h3>
          {this.isHTML() ? (
            <div dangerouslySetInnerHTML={{ __html: response.value }} />
          ) : (
            <p>{response.value}</p>
          )}
        </div>
      );
    }

    return (
      <ProposalPrivateField
        show={response.question.private}
        children={value}
        divClassName="block"
      />
    );
  }
}

export default createFragmentContainer(
  ProposalResponse,
  graphql`
    fragment ProposalResponse_response on Response {
      question {
        id
        type
        title
        private
      }
      ... on ValueResponse {
        value
      }
      ... on MediaResponse {
        medias {
          ...ProposalMediaResponse_medias
        }
      }
    }
  `,
);
