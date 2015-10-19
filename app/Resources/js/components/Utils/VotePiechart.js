const VotePiechart = React.createClass({
  propTypes: {
    ok: React.PropTypes.number.isRequired,
    nok: React.PropTypes.number.isRequired,
    mitige: React.PropTypes.number.isRequired,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    top: React.PropTypes.number,
    left: React.PropTypes.number,
  },
  mixins: [ReactIntl.IntlMixin],

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
    const PieChart = google.visualization.PieChart;
    const DataTable = google.visualization.arrayToDataTable;

    (new PieChart(React.findDOMNode(this.refs.piechart))).draw(
      new DataTable([
        [{type: 'string'}, {type: 'number'}],
        [this.getIntlMessage('vote.ok'), this.props.ok],
        [this.getIntlMessage('vote.mitige'), this.props.mitige],
        [this.getIntlMessage('vote.nok'), this.props.nok],
      ]), {
        legend: 'none',
        chartArea: {
          left: this.props.left,
          top: this.props.top,
          width: '100%',
          height: '85%',
        },
        colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
        pieSliceText: 'value',
        height: this.props.height,
        width: this.props.width,
        backgroundColor: 'transparent',
      });
  },

  render() {
    return <div className="opinion__chart" ref="piechart" />;
  },

});

export default VotePiechart;
