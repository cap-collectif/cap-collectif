// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { QuestionnaireAdminResultsPieChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminResultsBarChart_multipleChoiceQuestion.graphql';
import colors from '../../utils/colors';
import config from '../../config';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsPieChart_multipleChoiceQuestion,
  intl: IntlShape,
};

export class QuestionnaireAdminResultsPieChart extends React.Component<Props> {
  renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: Object) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" key={index} textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  render() {
    const { multipleChoiceQuestion, intl } = this.props;

    const data =
      multipleChoiceQuestion.questionChoices &&
      multipleChoiceQuestion.questionChoices
        .filter(choice => choice.responses.totalCount > 0)
        .reduce((acc, curr) => {
          acc.push({
            name: curr.title,
            value: curr.responses.totalCount,
          });
          return acc;
        }, []);

    if (
      data &&
      multipleChoiceQuestion &&
      multipleChoiceQuestion.isOtherAllowed &&
      multipleChoiceQuestion.otherResponses &&
      multipleChoiceQuestion.otherResponses.totalCount !== 0
    ) {
      data.push({
        name: intl.formatMessage({ id: 'global.question.types.other' }),
        value:
          multipleChoiceQuestion.otherResponses && multipleChoiceQuestion.otherResponses.totalCount,
      });
    }

    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="pie-chart__container mb-20">
            <ResponsiveContainer>
              <PieChart>
                {config.isMobile ? (
                  <Legend verticalAlign="bottom" />
                ) : (
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ width: '60%' }}
                  />
                )}
                <Pie
                  data={data}
                  innerRadius={25}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                  fontSize="16px"
                  isAnimationActive={false}
                  dataKey="value"
                  labelLine={false}
                  label={this.renderCustomizedLabel}>
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      aria-labelledby={entry.name}
                      fill={colors.accessibleColors[index % colors.accessibleColors.length]}
                    />
                  ))}{' '}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
}

const container = injectIntl(QuestionnaireAdminResultsPieChart);

export default createFragmentContainer(container, {
  multipleChoiceQuestion: graphql`
    fragment QuestionnaireAdminResultsPieChart_multipleChoiceQuestion on MultipleChoiceQuestion {
      questionChoices {
        title
        responses {
          totalCount
        }
      }
      isOtherAllowed
      otherResponses {
        totalCount
      }
    }
  `,
});
