import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { type ResponseValue_response } from './__generated__/ResponseValue_response.graphql';
import { getValueFromResponse } from '../../../utils/responsesHelper';

// create test for this component

type Props = {
  response: ResponseValue_response,
};

export class ResponseValue extends React.Component<Props> {
  render() {
    const { response } = this.props;

    const responseValue = getValueFromResponse(response.question.type, response.value);

    if (!responseValue || (Array.isArray(responseValue) && !responseValue.length)) {
      return <p>{<FormattedMessage id="reply.show.response.no_value" />}</p>;
    }
    if (response.question.type === 'editor') {
      return (
        <p>
          <div dangerouslySetInnerHTML={{ __html: responseValue }} />
        </p>
      );
    }
    if (response.question.type === 'ranking') {
      return responseValue.labels && responseValue.labels.length > 0 ? (
        <ol>
          {responseValue.labels.map((label, index) => {
            return <li key={index}>{label}</li>;
          })}
        </ol>
      ) : (
        <p>
          <FormattedMessage id="reply.show.response.no_value" />
        </p>
      );
    }
    if (
      responseValue &&
      typeof responseValue === 'object' &&
      typeof responseValue.labels !== 'undefined'
    ) {
      const labels = responseValue.labels;
      if (labels && responseValue.other) {
        labels.push(responseValue.other);
      }
      return labels.length > 0 ? (
        <p>{labels.join(', ')}</p>
      ) : (
        <p>{<FormattedMessage id="reply.show.response.no_value" />}</p>
      );
    }
    return <p>{responseValue}</p>;
  }
}

export default createFragmentContainer(ResponseValue, {
  response: graphql`
    fragment ResponseValue_response on Response {
      question {
        id
        type
      }
      ... on ValueResponse {
        value
      }
    }
  `,
});
