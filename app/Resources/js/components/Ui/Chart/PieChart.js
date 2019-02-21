// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Cell, Legend, Pie, PieChart as Chart, ResponsiveContainer } from 'recharts';

type Props = {
  data: Array<Object>,
  innerRadius: number, 
  outerRadius: number,
  colors: Array<string>,
  maxWidth?: string,
  height: string
}

const PieChart = (props: Props) => {
  const { data, innerRadius, outerRadius, colors, maxWidth, height } = props;

  const renderCustomizedLabel = ({
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

  const ContentWrapper = styled.div`
    max-width: ${props => props.maxWidth ? props.maxWidth : 'none'};
    height: ${propos => props.height};
    width: 100%;

    .recharts-pie {
      font-weight: 500;
    }

    .recharts-legend-wrapper {
      line-height: normal;
    }
  `;

  return (
    <ContentWrapper maxWidth={maxWidth} height={height}>
      <ResponsiveContainer>
        <Chart>
          <Legend layout="vertical" align="right" verticalAlign="middle" />
          <Pie
            data={data}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
            fontSize="16px"
            isAnimationActive={false}
            percent
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}>
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
  )
}

export default PieChart;
