import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ReactDOM from 'react-dom';

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

  componentDidMount() {
    this.initChart();
  },

  componentDidUpdate() {
    this.initChart();
  },

  initChart() {
    if (!ReactDOM.findDOMNode(this.refs.piechart) || !google || !google.visualization || !google.visualization.PieChart) {
      return;
    }
    const PieChart = google.visualization.PieChart;
    const DataTable = google.visualization.arrayToDataTable;
    const { ok, mitige, nok, left, top, height, width } = this.props;

    (new PieChart(ReactDOM.findDOMNode(this.refs.piechart))).draw(
      new DataTable([
        [{ type: 'string' }, { type: 'number' }],
        [this.getIntlMessage('vote.ok'), ok],
        [this.getIntlMessage('vote.mitige'), mitige],
        [this.getIntlMessage('vote.nok'), nok],
      ]), {
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
      });
  },

  render() {
    if (this.props.ok || this.props.mitige || this.props.nok) {
      return <div className="opinion__chart" ref="piechart" />;
    }
    return null;
  },

});

export default VotePiechart;
