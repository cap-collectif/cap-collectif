import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionPreview from './OpinionPreview';
import OpinionButtons from './OpinionButtons';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const OpinionBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.Required,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
    };
  },

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
      ["D'accord", this.props.opinion.votes_ok],
      ["Mitigé", this.props.opinion.votes_mitige],
      ["Pas d'accord", this.props.opinion.votes_nok]
    ]);

    const pieChart = new google.visualization.PieChart(React.findDOMNode(this.refs.piechart));
    pieChart.draw(data, {
      legend: 'none',
      colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
      pieSliceText: 'value',
      // height: 90,
      // width: 145,
      backgroundColor: 'transparent'
    });

  },


  render() {
    const opinion = this.props.opinion;
    return (
      <div className="block block--bordered opinion__details">
        <div className="opinion opinion--red opinion--current">
          <div className="opinion__header opinion__header--centered">
            <a className="neutral-hover pull-left h4 opinion__header__back" href="/consultations/open-data-liberer-les-donnees-publiques/consultation/consultation-1/opinions/probleme">
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs  hidden-sm"> Retour</span>
            </a>
            <h2 className="h4 opinion__header__title">Problème </h2>
          </div>
          <OpinionPreview opinion={opinion} />
        </div>
        <div className="opinion__description">
          <div ref="piechart" className="opinion__chart center-block" />
          { opinion.body }
          <div className="opinion__buttons">
            <OpinionButtons {...this.props} opinion={opinion} />
          </div>
        </div>
      </div>
    );
  },

});

export default OpinionBox;
