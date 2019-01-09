// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import { injectIntl, type IntlShape } from 'react-intl';
import OpinionPreview from './OpinionPreview';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
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
                {/*<Legend*/}
                  {/*layout="vertical"*/}
                  {/*align="left"*/}
                  {/*verticalAlign="middle"*/}
                  {/*content={({ name, value }) => `${name}: ${value}`}*/}
                {/*/>*/}
                <Pie
                  data={data}
                  innerRadius={10}
                  outerRadius={50}
                  paddingAngle={2}
                  stroke="none"
                  fontSize="16px"
                  isAnimationActive={false}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  // label={this.renderCustomizedLabel}
                  // label={(name, value)=>`${name}: ${value}`}
                >
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
