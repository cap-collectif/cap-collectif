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

  componentDidMount() {
    const PieChart = google.visualization.PieChart;
    const DataTable = google.visualization.arrayToDataTable;

    (new PieChart(React.findDOMNode(this.refs.piechart))).draw(
      new DataTable([
        [{type: 'string'}, {type: 'number'}],
        ['D\'accord', this.props.ok],
        ['Mitigé', this.props.mitige],
        ['Pas d\'accord', this.props.nok],
      ]), {
        legend: 'none',
        chartArea: {
          left: this.props.left ? this.props.left : 0,
          top: this.props.top ? this.props.top : 0,
          width: '80%',
          height: '80%',
        },
        colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
        pieSliceText: 'value',
        height: this.props.height ? this.props.height : undefined,
        width: this.props.width ? this.props.width : undefined,
        backgroundColor: 'transparent',
      });
  },

  render() {
    return <div ref="piechart" />;
  },

});

export default VotePiechart;
