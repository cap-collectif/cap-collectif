// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { QuestionnaireAdminResultsPieChart_multipleChoiceQuestion } from './__generated__/QuestionnaireAdminResultsBarChart_multipleChoiceQuestion.graphql';
import colors from '../../utils/colors';
import { cleanMultipleChoiceQuestion } from '../../utils/cleanMultipleChoiceQuestion';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsPieChart_multipleChoiceQuestion,
  intl: IntlShape,
};

type State = {
  windowWidth: ?number,
};

export class QuestionnaireAdminResultsPieChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateWindowsWidth, false);
  }

  componentWillUnmount() {
    window.removeListener('resize', this.updateWindowsWidth, false);
  }

  getHeight = (choicesNumber: number) => {
    const { windowWidth } = this.state;

    if (choicesNumber && choicesNumber > 8) {
      return `${choicesNumber * 25}px`;
    }

    if (windowWidth && windowWidth < 992) {
      return '300px';
    }

    return '200px';
  };

  updateWindowsWidth = () => {
    this.setState({
      windowWidth: window.innerWidth,
    });
  };

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
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  render() {
    const { multipleChoiceQuestion, intl } = this.props;
    const { windowWidth } = this.state;

    const data = cleanMultipleChoiceQuestion(multipleChoiceQuestion, intl);

    return (
      <div className="row">
        <div className="col-xs-12">
          <div
            className="pie-chart__container mb-20"
            style={{ height: this.getHeight(data.length) }}>
            <ResponsiveContainer>
              <PieChart>
                {windowWidth && windowWidth < 992 ? (
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
      choices(allowRandomize: false) {
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
