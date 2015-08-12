import OpinionPreview from './OpinionPreview';
import OpinionButtons from './OpinionButtons';

const OpinionBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
    };
  },

  componentDidMount() {
    const PieChart = google.visualization.PieChart;
    const DataTable = google.visualization.arrayToDataTable;

    (new PieChart(React.findDOMNode(this.refs.piechart))).draw(
      new DataTable([
        [{type: 'string'}, {type: 'number'}],
        ['D\'accord', this.props.opinion.votes_ok],
        ['Mitigé', this.props.opinion.votes_mitige],
        ['Pas d\'accord', this.props.opinion.votes_nok],
      ]), {
        legend: 'none',
        colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
        pieSliceText: 'value',
        backgroundColor: 'transparent',
      });
  },

  render() {
    const opinion = this.props.opinion;
    const diff = JsDiff.diffWords(opinion.parent.body, opinion.body);
    let htmlBody = '';
    diff.forEach((part) => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      const decoration = color === 'red' ? 'line-through' : 'none';
      htmlBody += '<span style="color: ' + color + '; text-decoration: ' + decoration + '">' + part.value + '</span>';
    });

    const colorClass = 'opinion opinion--' + opinion.parent.type.color + ' opinion--current';
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered">
            <a className="neutral-hover pull-left h4 opinion__header__back" href={opinion.parent._links.show}>
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs  hidden-sm"> Retour</span>
            </a>
            <h2 className="h4 opinion__header__title"> {opinion.parent.type.title}</h2>
          </div>
          <OpinionPreview opinion={opinion} />
        </div>
        <div className="opinion__description">
          <div ref="piechart" className="opinion__chart center-block" />
          <div dangerouslySetInnerHTML={{__html: htmlBody}} />
          <div className="opinion__buttons" style={{marginBottom: 0}}>
            <OpinionButtons {...this.props} opinion={opinion} />
          </div>
        </div>
      </div>
    );
  },

});

export default OpinionBox;
