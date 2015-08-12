import OpinionPreview from './OpinionPreview';

const OpinionVersion = React.createClass({
  propTypes: {
    version: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  componentDidMount() {
    const PieChart = google.visualization.PieChart;
    const DataTable = google.visualization.arrayToDataTable;

    (new PieChart(React.findDOMNode(this.refs.piechart))).draw(
      new DataTable([
        [{type: 'string'}, {type: 'number'}],
        ['D\'accord', this.props.version.votes_ok],
        ['Mitigé', this.props.version.votes_mitige],
        ['Pas d\'accord', this.props.version.votes_nok],
      ]), {
        legend: 'none',
        colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
        pieSliceText: 'value',
        height: 90,
        width: 145,
        backgroundColor: 'transparent',
      });
  },

  render() {
    const version = this.props.version;
    return (
      <li className="opinion block--bordered has-chart">
        <div className="row">
          <div className="col-xs-12 col-sm-8 col-md-9 col-lg-10">
            <OpinionPreview opinion={version} />
          </div>
          <div className="hidden-xs col-sm-4 col-md-3 col-lg-2">
            <div ref="piechart" />
          </div>
        </div>
      </li>
    );
  },

});

export default OpinionVersion;
