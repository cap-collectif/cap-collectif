import React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactDOM from 'react-dom';

const VoteLinechart = React.createClass({
  propTypes: {
    history: React.PropTypes.array.isRequired,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
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
    const { height, history, width } = this.props;
    const AreaChart = google.visualization.AreaChart;
    const DataTable = google.visualization.arrayToDataTable;
    const lines = [
      [
        {
          type: 'datetime',
          label: <FormattedMessage id="vote.evolution.date" />,
        },
        { type: 'number', label: <FormattedMessage id="vote.evolution.nok" /> },
        {
          type: 'number',
          label: <FormattedMessage id="vote.evolution.mitige" />,
        },
        { type: 'number', label: <FormattedMessage id="vote.evolution.ok" /> },
      ],
    ];

    $.each(history, (i, row) => {
      lines.push([
        new Date(1000 * parseInt(row[0], 10)),
        row[1],
        row[2],
        row[3],
      ]);
    });

    const options = {
      hAxis: { titleTextStyle: { color: '#333' } },
      vAxis: {
        title: <FormattedMessage id="vote.evolution.vaxis" />,
        minValue: 0,
      },
      isStacked: true,
      colors: ['#d9534f', '#f0ad4e', '#5cb85c'],
      height,
      width,
      legend: { position: 'top', maxLines: 3 },
      theme: 'maximized',
    };

    new AreaChart(ReactDOM.findDOMNode(this.refs.linechart)).draw(
      new DataTable(lines),
      options,
    );
  },

  render() {
    return <div className="opinion__history_chart" ref="linechart" />;
  },
});

export default VoteLinechart;
