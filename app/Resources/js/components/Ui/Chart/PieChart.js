// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Cell, Pie, PieChart as Chart, ResponsiveContainer, Tooltip } from 'recharts';
import defaultColors from '../../../utils/colors';

type Data = {
  name: string,
  value: number,
};

type Props = {
  data: Array<Data>,
  innerRadius: number,
  outerRadius: number,
  colors: Array<string>,
  width: string,
  height: string,
};

const TooltipWrapper = styled.div`
  background-color: #fff;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid ${defaultColors.borderColor};
  white-space: nowrap;
`;

const ContentWrapper = styled.div.attrs({
  className: 'pie-chart__container',
})`
  width: ${props => props.width};
  height: ${props => props.height};
  display: flex;
  flex: 1 0 auto;
  font-size: 14px;

  .recharts-pie {
    font-weight: 500;
  }

  .recharts-legend-wrapper {
    line-height: normal;
  }
`;

export class PieChart extends React.Component<Props> {
  static defaultProps = {
    height: '95px',
    width: '115px',
    innerRadius: 10,
    outerRadius: 45,
  };

  renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
    value,
  }: Object) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" key={index} textAnchor="middle" dominantBaseline="central">
        {value > 0 ? value : ''}
      </text>
    );
  };

  renderTooltip = (props: { payload: Array<Object> }) => {
    const { payload } = props;

    if (payload && payload.length > 0) {
      return (
        <TooltipWrapper>
          {payload[0].name} - {payload[0].value}
        </TooltipWrapper>
      );
    }

    return null;
  };

  render() {
    const { data, innerRadius, outerRadius, colors, width, height } = this.props;

    return (
      <ContentWrapper width={width} height={height}>
        <ResponsiveContainer>
          <Chart>
            <Tooltip content={this.renderTooltip} />
            <Pie
              data={data}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
              percent
              dataKey="value"
              labelLine={false}
              label={this.renderCustomizedLabel}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  aria-labelledby={entry.name}
                  fill={colors[index % colors.length]}
                />
              ))}{' '}
            </Pie>
          </Chart>
        </ResponsiveContainer>
      </ContentWrapper>
    );
  }
}

export default PieChart;
