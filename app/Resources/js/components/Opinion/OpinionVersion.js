import UserAvatar from '../User/UserAvatar';
import LoginStore from '../../stores/LoginStore';
import OpinionPreview from './OpinionPreview';

const OpinionVersion = React.createClass({
  propTypes: {
    version: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  componentDidMount() {

    let data = new google.visualization.DataTable();

    // let data = new google.visualization.arrayToDataTable([
    //   ['D\'accord',     this.props.version.votes_ok ? 5 : 6],
    //   ['Mitigé',        this.props.version.votes_mitige ? 5 : 6],
    //   ['Pas d\'accord', this.props.version.votes_nok ? 5 : 6],
    // ]);

    data.addColumn('string', 'Task');
    data.addColumn('number', 'Values');
    data.addRows([
      ["D'accord", this.props.version.votes_ok],
      ["Mitigé", this.props.version.votes_mitige],
      ["Pas d'accord", this.props.version.votes_nok]
    ]);

    const pieChart = new google.visualization.PieChart(React.findDOMNode(this.refs.piechart));
    pieChart.draw(data, {
      legend: 'none',
      colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
      pieSliceText: 'value',
      height: 90,
      width: 145,
      backgroundColor: 'transparent'
    });

  },

  render() {
    const version = this.props.version;
    return (
      <li className="opinion has-chart">
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
