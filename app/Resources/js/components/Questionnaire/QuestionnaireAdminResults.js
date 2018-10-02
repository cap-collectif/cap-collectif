// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis} from 'recharts';
import { FormattedMessage } from 'react-intl';
import type { QuestionnaireAdminResults_questionnaire } from './__generated__/QuestionnaireAdminResults_questionnaire.graphql';

type Props = {
  questionnaire: QuestionnaireAdminResults_questionnaire,
}

export class QuestionnaireAdminResults extends React.Component<Props> {
  getBarChart = (choices: Array<Object>) => {

    // console.warn(choices);

    const data = [
      {name: "tom", value: 23},
      {name: "tommy", value: 1023},
      {name: "tom", value: 39},
    ];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number"/>
          <YAxis dataKey="name" type="category"/>
          <Bar dataKey='value' maxBarSize={30} fill='#8884d8' />
        </BarChart>
      </ResponsiveContainer>
    );

  };

  getPieChart = (choices: Array<Object>) => {
    // const data = [
    //   {name: "tom", value: 23},
    //   {name: "tommy", value: 87},
    //   {name: "tom", value: 39},
    // ];

    return (
      <div>piechart</div>
    );
  };

  getRankingTable = (choices: Array<Object>) => (
      <div>
        RANKING TABLE
      </div>
    );
  
  render() {
    const { questionnaire } = this.props;

    // console.log(questionnaire.questions);

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content mt-15">
          {questionnaire.questions
            .filter(q => q.type !=='section')
            .map((question, key) => (
              <div key={key}>
                <p>
                  <b>{key + 1}. {question.title}</b> <br/>
                  <span className="excerpt">
                    {/* {question.questionChoices && question.questionChoices[0].responses && question.questionChoices[0].responses.totalCount} réponses /{' '} */}
                    {question.participants.totalCount} participants <br/>
                    {question.required && <FormattedMessage id="global.required" />}
                  </span>
                </p>
                {question.type === "checkbox" && this.getBarChart(question.questionChoices)}
                {(question.type === "radio" || question.type === "select" || question.type === "button") && this.getPieChart(question.questionChoices)}
                {question.type === "ranking" && this.getRankingTable(question.questionChoices)}
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
        }
      }
    }
  `,
);
