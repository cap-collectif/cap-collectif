// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis,
  YAxis
} from 'recharts';
import { FormattedMessage } from 'react-intl';
import type { QuestionnaireAdminResults_questionnaire } from './__generated__/QuestionnaireAdminResults_questionnaire.graphql';

type Props = {
  questionnaire: QuestionnaireAdminResults_questionnaire,
}

export class QuestionnaireAdminResults extends React.Component<Props> {
  getBarChart = (choices: Array<Object>) => {
    const data = choices.reduce((acc, curr) => {
      acc.push({
        name: curr.title,
        value: curr.responses.totalCount
      });
      return acc;
    }, []);

    return (
      <ResponsiveContainer height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" /> {/* allowDataOverflow */}
          <Bar dataKey='value' maxBarSize={30} fill='#8884d8'>
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

  };

  getPieChart = (choices: Array<Object>) => {

    const data = choices.reduce((acc, curr) => {
      acc.push({
        name: curr.title,
        value: curr.responses.totalCount
      });
      return acc;
    }, []);

    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x  = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy  + radius * Math.sin(-midAngle * RADIAN);

      // console.warn(percent);

      return (
        <text x={x} y={y} fill={percent === 0 ? 'white' : 'white'} textAnchor="middle" dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
          {/* {percent > 0 && */}
            {/* `${(percent * 100).toFixed(0)}%` */}
          {/* } */}
        </text>
      );
    };

    const getRandomTintColor = (color: string) => {
      // const percent = (Math.random() * (0.5 - (-0.5)) - 0.5).toFixed(3);
      const percent = (Math.random() * ((-0.2) - (0.6)) + 0.2).toFixed(3);

      const f = parseInt(color.slice(1),16);
      const t = percent<0?0:255;
      const p = percent<0?percent*-1:percent;
      const R = f>>16;
      const G = f>>8&0x00FF;
      const B = f&0x0000FF;
      return `#${(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1)}`;
    };

    return (
      <ResponsiveContainer height={350}>
        <PieChart>
          <Pie
            data={data}
            // cx={500}
            // cy={200}
            innerRadius={25}
            outerRadius={80}
            paddingAngle={1}
            fill="#82ca9d"
            stroke="none"
            fontSize="16px"
            // fontWeight="bold"
            isAnimationActive={false}
            labelLine
            label={renderCustomizedLabel}
          >
             <LabelList dataKey="name" position="outside" stroke="none" offset={31} />
            {
              data.map((entry, index) => <Cell key={index} fill={getRandomTintColor('#0088FE')}/>)
            }
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  getRankingTable = (choices: Array<Object>) => {
    const data = choices.reduce((acc, curr) => {
      acc.push({
        title: curr.title,
        ranking: curr.responses.totalCount
      });
      return acc;
    }, []);

    return (
      <table>
        {choices.map(choice => {
          const test = choice.ranking;

          console.log(choice.ranking.length);

          // console.warn(test.length > 0 && test.sort((a, b) => a.position - b.position));

          return (
            <tr>
              <td style={{border: '1px solid black'}}>{choice.title}</td>
              {choice.ranking
              // .sort((a, b) => a.position - b.position)
                .map(r => (
                    <td style={{border: '1px solid black'}}>{r.responses.totalCount}</td>
                  )
                )}
            </tr>
          )
        })}
      </table>
    )
  };

  getQuestion = (question: Object) => {
    if(question.type === "checkbox") {
      return this.getBarChart(question.questionChoices);
    }

    if(question.type === "radio" || question.type === "select" || question.type === "button") {
      return this.getPieChart(question.questionChoices)
    }

    if(question.type === "ranking") {
      return this.getRankingTable(question.questionChoices);
    }
  };
  
  render() {
    const { questionnaire } = this.props;

    // console.log(questionnaire.questions);

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content mt-15">
          {questionnaire.questions.length > 0 ? (
            questionnaire.questions
              .filter(q => q.type !=='section')
              .map((question, key) => (
                <div key={key}>
                  <p>
                    <b>{key + 1}. {question.title}</b> <br/>
                    <span className="excerpt">
                    {/* {question.questionChoices && question.questionChoices[0].responses && question.questionChoices[0].responses.totalCount} réponses /{' '} */}
                      {question.participants.totalCount} participants <br/>
                      {question.required && <b><FormattedMessage id="mandatory-question" /></b>}
                  </span>
                  </p>
                  {this.getQuestion(question)}
                </div>
            ))
          ) : (
            <div>
              <FormattedMessage id="no-question" />
            </div>
          )}
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
            ranking {
              position
              responses {
                totalCount
              }
            }
          }
        }
      }
    }
  `,
);
