// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ProposalMediaResponse from './ProposalMediaResponse';
import TitleInvertContrast from '../../Ui/Typography/TitleInvertContrast';
import type { ProposalResponse_response } from '~relay/ProposalResponse_response.graphql';
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

  getEmptyResponseValue = () => {
    const { response } = this.props;

    return (
      <div className="block">
        <h3 className="h3">{response.question.title}</h3>
        <p className="excerpt">
          <FormattedMessage id="project.votes.widget.no_value" />
        </p>
      </div>
    );
  };

  render() {
    const response = this.props.response;
    const questionType = response.question.type;
    const responseWithJSON =
      questionType === 'button' ||
      questionType === 'radio' ||
      questionType === 'checkbox' ||
      questionType === 'ranking';
    const defaultEditorEmptyValue = '<p><br></p>';
    let value = '';

    if (questionType === 'section') {
      return (
        <div>
          <TitleInvertContrast>{response.question.title}</TitleInvertContrast>
        </div>
      );
    }

    if (
      (questionType === 'medias' && response.medias && response.medias.length === 0) ||
      (questionType === 'editor' && response.value === defaultEditorEmptyValue) ||
      ((!response.value || response.value.length === 0) && questionType !== 'medias')
    ) {
      return this.getEmptyResponseValue();
    }

    if (responseWithJSON && response.value) {
      const responseValue = JSON.parse(response.value);
      const labelsValue = responseValue.labels.filter(el => el != null);
      const otherValue = responseValue.other;

      if (!otherValue && labelsValue.length === 0) {
        return this.getEmptyResponseValue();
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
