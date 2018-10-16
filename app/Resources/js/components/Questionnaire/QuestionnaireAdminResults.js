// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import QuestionnaireAdminResultsBarChart from './QuestionnaireAdminResultsBarChart';
import QuestionnaireAdminResultsRanking from './QuestionnaireAdminResultsRanking';
import type { QuestionnaireAdminResults_questionnaire } from './__generated__/QuestionnaireAdminResults_questionnaire.graphql';
import config from '../../config';
import type { State } from '../../types';

type Props = {
  questionnaire: QuestionnaireAdminResults_questionnaire,
  backgroundColor: string,
};

export class QuestionnaireAdminResults extends React.Component<Props> {
  getPieChart = (choices: Array<Object>, backgroundColor: string) => {
    const data = choices.filter(choice => choice.responses.totalCount > 0).reduce((acc, curr) => {
      acc.push({
        name: curr.title,
        value: curr.responses.totalCount,
      });
      return acc;
    }, []);

    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
    }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="white" key={index} textAnchor="middle" dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    const getRandomTintColor = (color: string, key: number) => {
      const percent = -0.6 + (key / 10) * 3;

      const f = parseInt(color.slice(1), 16);
      const t = percent < 0 ? 0 : 255;
      const p = percent < 0 ? percent * -1 : percent;
      // eslint-disable-next-line
      const R = f >> 16;
      // eslint-disable-next-line
      const G = (f >> 8) & 0x00ff;
      // eslint-disable-next-line
      const B = f & 0x0000ff;
      return `#${(
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)}`;
    };

    return (
      <div className="row">
        <div className="col-xs-12">
          {/* <ResponsiveContainer width={config.isMobile ? '100%' : 450} height={300} aspect={config.isMobile ? null : 1.5}> */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {config.isMobile && <Legend verticalAlign="bottom" />
              // height={36}
              }
              <Pie
                data={data}
                innerRadius={25}
                outerRadius={80}
                paddingAngle={2}
                cy="45%"
                stroke="none"
                fontSize="16px"
                isAnimationActive={false}
                labelLine={!config.isMobile}
                label={renderCustomizedLabel}>
                {!config.isMobile && (
                  <LabelList
                    dataKey="name"
                    position="outside"
                    clockWise={0.5}
                    stroke="none"
                    offset={31}
                    scaleToFit="true"
                  />
                )}
                {data.map((entry, index) => (
                  <Cell key={index} fill={getRandomTintColor(backgroundColor, index)} />
                ))}{' '}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  getQuestion = (question: Object) => {
    const { backgroundColor } = this.props;

    if (question.type === 'text' || question.type === 'number' || question.type === 'file') {
      return `<span>L'affichage des résultats est pour le moment indisponible</span>`;
    }

    if (question.participants && question.participants.totalCount === 0) {
      return null;
    }

    if (question.type === 'checkbox') {
      return (
        <QuestionnaireAdminResultsBarChart
          multipleChoiceQuestion={question}
          backgroundColor={backgroundColor}
        />
      );
    }

    if (question.type === 'radio' || question.type === 'select' || question.type === 'button') {
      return this.getPieChart(question.questionChoices, backgroundColor);
    }

    if (question.type === 'ranking') {
      return <QuestionnaireAdminResultsRanking multipleChoiceQuestion={question} />;
    }
  };

  render() {
    const { questionnaire } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content mt-15">
          {questionnaire.questions.length > 0 ? (
            questionnaire.questions.filter(q => q.type !== 'section').map((question, key) => (
              <div key={key}>
                <p>
                  <b>
                    {key + 1}. {question.title}
                  </b>{' '}
                  <br />
                  <span className="excerpt">
                    {question.participants && question.participants.totalCount !== 0 ? (
                      <FormattedMessage
                        id="global.counters.contributors"
                        values={{ num: question.participants.totalCount }}
                      />
                    ) : (
                      <FormattedMessage id="no-answer" />
                    )}
                    <br />
                    {question.required && (
                      <b>
                        <FormattedMessage id="mandatory-question" />
                      </b>
                    )}
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  backgroundColor: state.default.parameters['color.btn.primary.bg'],
});

const container = connect(mapStateToProps)(QuestionnaireAdminResults);

export default createFragmentContainer(
  container,
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
        ...QuestionnaireAdminResultsBarChart_multipleChoiceQuestion
        ...QuestionnaireAdminResultsRanking_multipleChoiceQuestion
      }
    }
  `,
);
