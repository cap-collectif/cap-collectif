// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import OpinionPreview from './OpinionPreview';
// import VotePiechart from '../Utils/VotePiechart';
import type { OpinionVersion_version } from './__generated__/OpinionVersion_version.graphql';
import colors from '../../utils/colors';

type Props = {
  version: OpinionVersion_version,
  rankingThreshold: ?number,
  intl: IntlShape,
};

class OpinionVersion extends React.Component<Props> {
  // renderCustomizedLabel = ({
  //                            cx,
  //                            cy,
  //                            midAngle,
  //                            innerRadius,
  //                            outerRadius,
  //                            percent,
  //                            index,
  //                          }: Object) => {
  //   const RADIAN = Math.PI / 180;
  //   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  //   const x = cx + radius * Math.cos(-midAngle);
  //   const y = cy + radius * Math.sin(-midAngle);
  //
  //   return (
  //     <text x={x} y={y} key={index}>
  //       {`${(percent * 100).toFixed(1)}%`}
  //     </text>
  //   );
  // };

  // renderLegend = (props) => {
  //   console.log(props);
  //   const { payload } = props;
  //
  //   return (
  //     <text >
  //       {payload.value} : {payload.}
  //     </text>
  //   );
  // };

  renderCustomizedLabel = ({
     cx,
     cy,
     midAngle,
     innerRadius,
     outerRadius,
     index,
     value
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

    if(payload.length > 0) {
      return (
        <div>{payload[0].name}</div>
      )
    }

    return null;
  };

  render() {
    const { version, rankingThreshold, intl } = this.props;

    const data = [
      { name: intl.formatMessage({ id: 'vote.ok' }), value: version.votesOk.totalCount },
      { name: intl.formatMessage({ id: 'vote.nok' }), value: version.votesNok.totalCount },
      { name: intl.formatMessage({ id: 'vote.mitige' }), value: version.votesMitige.totalCount },
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
          <div style={{ width: '400px', height: '150px'}}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  content={this.renderTooltip}
                  // formatter={(name) => {
                  //   return `${name}`;
                  // }}
                />
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
                  // label={({ name, value }) => `${name} (${value})`}
                  label={this.renderCustomizedLabel}
                  // label={(name, value)=>`${name}: ${value}`}
                >
                  {data.map((entry, index) => {
                    console.log(entry);

                    return (
                      <Cell
                        key={index}
                        aria-labelledby={entry.name}
                        fill={colors.votes[index % colors.votes.length]}
                      />
                    )
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
