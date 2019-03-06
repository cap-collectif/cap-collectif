// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalMediaResponse from './ProposalMediaResponse';
import TitleInvertContrast from '../../Ui/Typography/TitleInvertContrast';
import type { ProposalResponse_response } from './__generated__/ProposalResponse_response.graphql';
import PrivateBox from '../../Ui/Boxes/PrivateBox';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {
  response: ProposalResponse_response,
};

type radioLabelsType = {
  labels: [string],
  other: string,
};

export class ProposalResponse extends React.PureComponent<Props> {
  isHTML = () => {
    const { response } = this.props;
    return response.value && /<[a-z][\s\S]*>/i.test(response.value);
  };

  isRadioEmpty = (radioLabels: radioLabelsType) =>
    radioLabels.labels.length === 0 && !radioLabels.other;

  renderUniqueLabel = (radioLabels: radioLabelsType) => {
    if (!radioLabels) {
      return null;
    }

    if (radioLabels.labels[0]) {
      return <p>{radioLabels.labels[0]}</p>;
    }

    if (radioLabels.other) {
      return <p>{radioLabels.other}</p>;
    }

    return null;
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

    if (response.question.type === 'radio') {
      const radioLabelsValue = JSON.parse(response.value || '');
      if (this.isRadioEmpty(radioLabelsValue)) {
        return null;
      }
    }

    switch (response.question.type) {
      case 'medias':
        value = (
          <div>
            <h3 className="h3">{response.question.title}</h3>
            {/* $FlowFixMe */}
            <ProposalMediaResponse medias={response.medias} />
          </div>
        );
        break;

      case 'radio':
      case 'checkbox':
      case 'button': {
        const radioLabels = JSON.parse(response.value || '');
        value = (
          <div>
            <h3 className="h3">{response.question.title}</h3>
            {radioLabels && radioLabels.labels.length > 1 ? (
              <ul>
                {radioLabels.labels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
                {radioLabels.other && <li>{radioLabels.other}</li>}
              </ul>
            ) : (
              this.renderUniqueLabel(radioLabels)
            )}
          </div>
        );
        break;
      }
      case 'ranking': {
        const radioLabels = JSON.parse(response.value || '');
        value = (
          <div>
            <h3 className="h3">{response.question.title}</h3>
            <ol>
              {radioLabels &&
                radioLabels.labels.map((label, index) => <li key={index}>{label}</li>)}
            </ol>
          </div>
        );
        break;
      }

      default: {
        let responseValue = '';
        if (response.question.type !== 'number') {
          try {
            responseValue = JSON.parse(response.value || '');
          } catch (e) {
            responseValue = response.value || '';
          }
        }
        responseValue = response.value || '';

        value = (
          <div>
            <h3 className="h3">{response.question.title}</h3>
            {this.isHTML() ? <WYSIWYGRender value={response.value} /> : <p>{responseValue}</p>}
          </div>
        );
      }
    }

    return <PrivateBox show={response.question.private} children={value} divClassName="block" />;
  }
}

export default createFragmentContainer(
  ProposalResponse,
  graphql`
    fragment ProposalResponse_response on Response {
      question {
        ...responsesHelper_question @relay(mask: false)
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
