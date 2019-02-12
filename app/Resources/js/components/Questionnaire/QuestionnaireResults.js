// @flow
import * as React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {createFragmentContainer, graphql} from "react-relay";
import type {QuestionnaireResults_questionnaire} from './__generated__/QuestionnaireResults_questionnaire.graphql'
import DatesInterval from "../Utils/DatesInterval";

type Props = {
  questionnaire: ?QuestionnaireResults_questionnaire
};

export class QuestionnaireResults extends React.Component<Props> {
  render() {
    const {questionnaire} = this.props;
    let totalTotalCount = 0;
    questionnaire.questions.map(question => {
      totalTotalCount += question.responses ? question.responses.totalCount : 0;
    });

    return (
      <div>
        <h2 className="h2">
          <FormattedMessage id="results"/>
        </h2>
        <div>
          {totalTotalCount === 0 ? (
              <FormattedMessage id="no_result"/>
            ) :
            <div className="mb-30 project__step-dates">
              {(questionnaire.step.startAt || questionnaire.step.endAt) && (
                <div className="mr-15 d-ib">
                  <i className="cap cap-calendar-2-1"/>{' '}
                  <DatesInterval startAt={questionnaire.step.startAt} endAt={questionnaire.step.endAt} fullDay/>
                </div>
              )}
            </div>
          }
        </div>
      </div>
    );
  }
}

const container = injectIntl(QuestionnaireResults);

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireResults_questionnaire on Questionnaire {
      questions {
        ... on MultipleChoiceQuestion {
          id
          title
          resultOpen
          responses {
            totalCount
            edges {
              node {
                ... on ValueResponse {
                  value
                }
              }
            }
          }
        }
        ... on SimpleQuestion {
          id
          title
          description
          resultOpen
          responses {
            totalCount
            edges {
              node {
                ... on ValueResponse {
                  value
                }
              }
            }
          }
        }
        ... on MediaQuestion {
          id
          title
          description
          resultOpen
          responses {
            totalCount
            edges {
              node {
                ... on MediaResponse {
                  medias {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
      step {
        startAt
        endAt
      }
    }
  `,
});
