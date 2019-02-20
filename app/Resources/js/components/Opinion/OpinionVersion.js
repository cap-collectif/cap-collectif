// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import OpinionPreview from './OpinionPreview';
import type { OpinionVersion_version } from './__generated__/OpinionVersion_version.graphql';
import colors from '../../utils/colors';

type Props = {
  version: OpinionVersion_version,
  rankingThreshold: ?number,
  intl: IntlShape,
};

class OpinionVersion extends React.Component<Props> {
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
        {value}
      </text>
    );
  };

  renderTooltip = ({ payload, type, label }) => {
    console.log(payload);
    console.warn(type, label);

    if (payload.length > 0) {
      return (
        <div className="block" style={{ backgroundColor: '#fff' }}>
          {payload[0].name}
        </div>
      );
    }

    return null;
  };

  render() {
    const { version, rankingThreshold, intl } = this.props;

    const data = [
      { name: intl.formatMessage({ id: 'vote.ok' }), value: version.votesOk.totalCount },
      { name: intl.formatMessage({ id: 'vote.mitige' }), value: version.votesMitige.totalCount },
      { name: intl.formatMessage({ id: 'vote.nok' }), value: version.votesNok.totalCount },
    ];

    return (
      <ListGroupItem
        className={`list-group-item__opinion has-chart${
          version.author && version.author.vip ? ' bg-vip' : ''
        }`}>
        <div className="left-block">
          {/* $FlowFixMe */}
          <OpinionPreview opinion={version} rankingThreshold={rankingThreshold} />
        </div>
        {version.votes && version.votes.totalCount > 0 ? (
          <div className="opinion__pie-chart">
            <ResponsiveContainer>
              <PieChart>
                <Legend layout="vertical" align="right" verticalAlign="middle" />
                <Pie
                  data={data}
                  innerRadius={10}
                  outerRadius={50}
                  paddingAngle={2}
                  stroke="none"
                  fontSize="16px"
                  isAnimationActive={false}
                  percent
                  dataKey="value"
                  labelLine={false}
                  label={this.renderCustomizedLabel}>
                  {data.map((entry, index) => {
                    console.log(entry);

                    return (
                      <Cell
                        key={index}
                        aria-labelledby={entry.name}
                        fill={colors.votes[index % colors.votes.length]}
                      />
                    );
                  })}{' '}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </ListGroupItem>
    );
  }
}

const container = injectIntl(OpinionVersion);

export default createFragmentContainer(container, {
  version: graphql`
    fragment OpinionVersion_version on Version {
      ...OpinionPreview_opinion
      author {
        vip
      }
      votes(first: 0) {
        totalCount
      }
      votesOk: votes(first: 0, value: YES) {
        totalCount
      }
      votesNok: votes(first: 0, value: NO) {
        totalCount
      }
      votesMitige: votes(first: 0, value: MITIGE) {
        totalCount
      }
    }
  `,
});
