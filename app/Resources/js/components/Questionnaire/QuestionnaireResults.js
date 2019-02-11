// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import {createFragmentContainer, graphql} from "react-relay";
import type {QuestionnaireResults_questionnaire} from './__generated__/QuestionnaireResults_questionnaire.graphql'

type Props = {
  intl: IntlShape,
  questionnaire: ?QuestionnaireResults_questionnaire
};

export class QuestionnaireResults extends React.Component<Props> {
  render() {
    const {questionnaire, intl} = this.props;

    return (
      <div>
        <h2 className="h2">
          <FormattedMessage id="results" />
        </h2>
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
    }
  `,
});
