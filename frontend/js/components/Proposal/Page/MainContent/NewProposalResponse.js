// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import type { NewProposalResponse_response } from '~relay/NewProposalResponse_response.graphql';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { isHTML } from '~/utils/isHtml';
import colors from '~/utils/colors';
import Tooltip from '~/components/Utils/Tooltip';
import File from '~ui/File/File';
import { type GlobalState } from '~/types';
import { COLORS as COLORS_MAJORITY } from '~ui/Form/Input/Majority/Majority';
import type { MajorityProperty } from '~ui/Form/Input/Majority/Majority';

type Props = {|
  +response: NewProposalResponse_response,
  color: string,
|};

type RadioType = {|
  +labels: [string],
  +other: string,
|};

const SubSectionTitle: StyledComponent<{ color: string }, {}, HTMLHeadingElement> = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: ${({ color }) => color};
  border-bottom: 1px solid #d8d8d8;
  padding-bottom: 5px;
`;

const QuestionTitle: StyledComponent<{ margin?: boolean }, {}, HTMLHeadingElement> = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${colors.darkText};
  margin: 0;
  margin-bottom: 10px;
  margin-top: ${({ margin }) => margin && '20px'};
`;

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  margin-top: 20px;

  > h3 {
    margin-left: 5px;
  }
`;

const PrivateTitle = ({
  isPrivate,
  title,
  color,
  id,
}: {
  isPrivate: boolean,
  title: string,
  id: string,
  color: string,
}) => {
  if (isPrivate)
    return (
      <Container>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`private-question-proposal-${id}`}>
              <FormattedMessage id="global.private" />
            </Tooltip>
          }>
          <Icon name={ICON_NAME.lock} size={16} color={color} />
        </OverlayTrigger>
        <QuestionTitle>{title}</QuestionTitle>
      </Container>
    );
  return <QuestionTitle margin>{title}</QuestionTitle>;
};

export class NewProposalResponse extends React.PureComponent<Props> {
  renderUniqueLabel = (radioLabels: ?RadioType) => {
    if (!radioLabels) {
      return null;
    }

    if (radioLabels.labels && Array.isArray(radioLabels.labels)) {
      if (radioLabels.labels[0]) {
        return <p>{radioLabels.labels[0]}</p>;
      }
    }

    if (radioLabels.other) {
      return <p>{radioLabels.other}</p>;
    }

    return null;
  };

  getEmptyResponseValue = () => {
    const { response, color } = this.props;

    return (
      <div className="block">
        <PrivateTitle
          isPrivate={response.question.private}
          title={response.question.title}
          id={response.question.id}
          color={color}
        />
        <p className="excerpt">
          <FormattedMessage id="project.votes.widget.no_value" />
        </p>
      </div>
    );
  };

  render() {
    const { response, color } = this.props;
    const questionType = response.question.type;
    const responseWithJSON =
      response.question.__typename === 'MultipleChoiceQuestion' &&
      response.question.type !== 'select';
    const defaultEditorEmptyValue = '<p><br></p>';
    let value = '';
    if (questionType === 'section') {
      return (
        <div>
          <SubSectionTitle color={color}>{response.question.title}</SubSectionTitle>
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
      let responseValue = null;
      try {
        responseValue = JSON.parse(response.value);
      } catch (e) {
        // console.error('Could not parse JSON.');
      }
      if (!responseValue) {
        // In case JSON is not valid, we show an empty response.
        return this.getEmptyResponseValue();
      }
      if (responseValue.labels && Array.isArray(responseValue.labels)) {
        const labelsValue = responseValue.labels.filter(el => el != null);
        const otherValue = responseValue.other;

        if (!otherValue && labelsValue.length === 0) {
          return this.getEmptyResponseValue();
        }
      }
    }

    switch (response.question.type) {
      case 'medias':
        value = (
          <div>
            <PrivateTitle
              isPrivate={response.question.private}
              title={response.question.title}
              id={response.question.id}
              color={color}
            />
            <Row>
              {response.medias?.map((media, key) => (
                <Col xs={12} md={12} lg={12} key={key} className="mb-10">
                  <File name={media.name} size={media.size} url={media.url} id={media.id} />
                </Col>
              ))}
            </Row>
          </div>
        );
        break;

      case 'radio':
      case 'checkbox':
      case 'button': {
        const radioLabels = JSON.parse(response.value || '');
        if (radioLabels && !radioLabels.labels) {
          value = (
            <div>
              <PrivateTitle
                isPrivate={response.question.private}
                title={response.question.title}
                id={response.question.id}
                color={color}
              />
              <p>{radioLabels}</p>
            </div>
          );
        } else {
          value = (
            <div>
              <PrivateTitle
                isPrivate={response.question.private}
                title={response.question.title}
                id={response.question.id}
                color={color}
              />
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
        }
        break;
      }
      case 'ranking': {
        const radioLabels = JSON.parse(response.value || '');
        if (radioLabels && !radioLabels.labels) {
          value = (
            <div>
              <PrivateTitle
                isPrivate={response.question.private}
                title={response.question.title}
                id={response.question.id}
                color={color}
              />
              <p>{radioLabels}</p>
            </div>
          );
        } else {
          value = (
            <div>
              <PrivateTitle
                isPrivate={response.question.private}
                title={response.question.title}
                id={response.question.id}
                color={color}
              />
              <ol>
                {radioLabels &&
                  radioLabels.labels.map((label, index) => <li key={index}>{label}</li>)}
              </ol>
            </div>
          );
        }
        break;
      }

      case 'majority': {
        const majorities = ((Object.values(COLORS_MAJORITY): any): MajorityProperty[]);
        const majorityResponse = ((majorities.find(
          majority => majority.value === response.value,
        ): any): MajorityProperty);

        value = (
          <div>
            <PrivateTitle
              isPrivate={response.question.private}
              title={response.question.title}
              id={response.question.id}
              color={color}
            />
            <FormattedMessage id={majorityResponse.label} />
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

          responseValue = (
            <WYSIWYGRender
              value={(responseValue && responseValue.toString().replace(/\n/g, '<br />')) || ''}
            />
          );
        } else {
          // it's a number
          responseValue = response.value || '';
          responseValue = <p>{responseValue}</p>;
        }

        value = (
          <div>
            <PrivateTitle
              isPrivate={response.question.private}
              title={response.question.title}
              id={response.question.id}
              color={color}
            />
            {response.value && isHTML(response.value) ? (
              <WYSIWYGRender value={response.value} />
            ) : (
              responseValue
            )}
          </div>
        );
      }
    }

    return value;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  color: state.default.parameters['color.btn.primary.bg'],
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(NewProposalResponse),
  {
    response: graphql`
      fragment NewProposalResponse_response on Response {
        question {
          __typename
          ...responsesHelper_question @relay(mask: false)
        }
        ... on ValueResponse {
          value
        }
        ... on MediaResponse {
          medias {
            id
            name
            size
            url
          }
        }
      }
    `,
  },
);
