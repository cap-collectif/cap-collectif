import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Chart } from 'react-google-charts';

const VotePiechart = React.createClass({
  propTypes: {
    ok: PropTypes.number,
    nok: PropTypes.number,
    mitige: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      ok: 0,
      nok: 0,
      mitige: 0,
      height: undefined,
      width: undefined,
      top: 0,
      left: 0,
    };
  },

  render() {
    const { ok, mitige, nok, left, top, height, width } = this.props;
    if (ok + mitige + nok > 0) {
      return (
        <Chart
          chartType="PieChart"
          data={[
              [{ type: 'string' }, { type: 'number' }],
              [this.getIntlMessage('vote.ok'), ok],
              [this.getIntlMessage('vote.mitige'), mitige],
              [this.getIntlMessage('vote.nok'), nok],
          ]}
          options={{
            legend: 'none',
            chartArea: {
              left: left,
              top: top,
              width: '100%',
              height: '85%',
            },
            colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
            pieSliceText: 'value',
            height: height,
            width: width,
            backgroundColor: 'transparent',
          }}
        />
      );
    }
  },
});

export default VotePiechart;
