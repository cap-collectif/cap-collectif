// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { QuestionnaireAdminResults_questionnaire } from './__generated__/QuestionnaireAdminResults_questionnaire.graphql';

type Props = {
  questionnaire: QuestionnaireAdminResults_questionnaire,
}

export class QuestionnaireAdminResults extends React.Component<Props> {
  render() {
    const { questionnaire } = this.props;

    // console.log(questionnaire.questions.type);

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content mt-15">
          {questionnaire.questions
            .filter(q => q.type !=='section')
            .map((question, key) => (
              <div>
                <p>
                  <b>{key + 1}. {question.title}</b> <br/>
                  <span className="excerpt">
                    {question.questionChoices && question.questionChoices[0].responses && question.questionChoices[0].responses.totalCount} réponses /{' '}
                    {question.participants.totalCount} participants <br/>
                    {question.required && <FormattedMessage id="global.required" />}
                  </span>
                </p>
              </div>
          ))}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  QuestionnaireAdminResults,
  graphql`
    fragment QuestionnaireAdminResults_questionnaire on Questionnaire {
      questions {
        title
        type
        required
        participants {
          totalCount
        }
        ... on MultipleChoiceQuestion {
          questionChoices {
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
        }
      }
    }
  `,
);
