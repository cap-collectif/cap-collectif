// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Legend, ResponsiveContainer, Cell, Pie, PieChart, Tooltip } from 'recharts';
import { type QuestionnaireAdminResultsPieChart_multipleChoiceQuestion } from '~relay/QuestionnaireAdminResultsPieChart_multipleChoiceQuestion.graphql';
import colors from '~/utils/colors';
import { cleanMultipleChoiceQuestion } from '~/utils/cleanMultipleChoiceQuestion';
import { TooltipWrapper } from '../Ui/Chart/PieChart';

type Props = {
  multipleChoiceQuestion: QuestionnaireAdminResultsPieChart_multipleChoiceQuestion,
  intl: IntlShape,
  innerRef: (ref: ?React.Ref<any>) => void,
};

type State = {
  windowWidth: ?number,
};

const RADIAN = Math.PI / 180;

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
    window.removeEventListener('resize', this.updateWindowsWidth, false);
  }

  getHeight = (choicesNumber: number) => {
    const { windowWidth } = this.state;

    if (choicesNumber && choicesNumber > 8) {
      return `${choicesNumber * 25}px`;
    }

    if (windowWidth && windowWidth < 992) {
      return '300px';
    }

    return '300px';
  };

  updateWindowsWidth = () => {
    this.setState({
      windowWidth: window.innerWidth,
    });
  };

  renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, fill, percent }: Object) => {
    if (percent < 0.05) return null;

    let angle = midAngle <= 91 && midAngle >= 89 ? 88 : midAngle;
    angle = angle <= 271 && midAngle >= 269 ? 268 : angle;
    const sin = Math.sin(-RADIAN * angle);
    const cos = Math.cos(-RADIAN * angle);
    const delta = Math.abs(1 / cos) + 10;
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + delta) * cos;
    const my = cy + (outerRadius + delta) * sin;
    const ex = mx + Number(cos.toFixed(1)) * 20;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="" fill="none" />
        <text x={ex + (cos >= 0 ? 1 : -1)} y={ey + 4} textAnchor={textAnchor} fill={fill}>
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

  renderCustomizedLabelLine = ({ points, stroke, percent }: Object) => {
    return percent < 0.05 ? null : (
      <path
        stroke={stroke}
        d={`M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`}
        className="customized-label-line"
      />
    );
  };

  renderTooltip = ({ payload }: { payload: Array<Object> }) => {
    if (payload && payload.length > 0) {
      return (
        <TooltipWrapper>
          {payload[0].name} - {payload[0].value}
        </TooltipWrapper>
      );
    }

    return null;
  };

  renderLegend = ({ payload }: { payload: Array<Object> }) => {
    return (
      <ul>
        {payload.map(({ payload: data }, index) => (
          <li
            key={`item-${index}`}
            style={{
              color: 'black',
              display: 'flex',

              listStyle: 'none',
              marginBottom: '8px',
            }}>
            <div
              style={{
                background: data.fill,
                width: '20px',
                height: '14px',
                marginRight: '5px',
                flex: 'none',
                marginTop: '4px',
              }}
            />
            {data.name} -{' '}
            {this.props.intl.formatMessage({ id: 'count-answers' }, { num: data.value })} -{' '}
            {`${(data.percent * 100).toFixed(2)}%`}
          </li>
        ))}
      </ul>
    );
  };

  render() {
    const { multipleChoiceQuestion, intl, innerRef } = this.props;
    const { windowWidth } = this.state;

    const data = cleanMultipleChoiceQuestion(multipleChoiceQuestion, intl);

    return (
      <div className="row">
        <div className="col-xs-12">
          <div
            className="pie-chart__container mb-20"
            style={{ height: this.getHeight(data.length) }}>
            <ResponsiveContainer>
              <PieChart ref={innerRef}>
                <Tooltip content={this.renderTooltip} />

                {windowWidth && windowWidth < 992 ? (
                  <Legend verticalAlign="bottom" content={this.renderLegend} />
                ) : (
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ width: '60%', paddingLeft: 100 }}
                    content={this.renderLegend}
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
                  labelLine={this.renderCustomizedLabelLine}
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
        edges {
          node {
            title
            responses {
              totalCount
            }
          }
        }
      }
      isOtherAllowed
      otherResponses {
        totalCount
      }
    }
  `,
});
