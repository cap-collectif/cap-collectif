import OpinionArgumentItem from './OpinionArgumentItem';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';

const FormattedMessage = ReactIntl.FormattedMessage;

const Col = ReactBootstrap.Col;
const Row = ReactBootstrap.Row;

const OpinionArgumentList = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      arguments: [],
      isLoading: true,
      filter: 'last',
    };
  },

  componentDidMount() {
    this.loadArgumentsFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadArgumentsFromServer();
    }
  },

  renderFilter() {
    if (this.state.arguments.length > 1) {
      return (
        <select ref="filter" className="form-control pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
          <option value="last">{this.getIntlMessage('global.filter_last')}</option>
          <option value="old">{this.getIntlMessage('global.filter_old')}</option>
          <option value="popular">{this.getIntlMessage('global.filter_popular')}</option>
        </select>
      );
    }
  },

  render() {
    return (
      <div id={'opinion__arguments--' + this.props.type} className="block--tablet block--bordered">
        <Row className="opinion__arguments__header">
          <Col xs={12} sm={6} md={6}>
            <h4 className="opinion__header__title">
              {this.props.type === 'simple'
                ? <FormattedMessage message={this.getIntlMessage('argument.simple.list')} num={this.props.opinion.arguments_yes_count} />
                : this.props.type === 'yes'
                  ? <FormattedMessage message={this.getIntlMessage('argument.yes.list')} num={this.props.opinion.arguments_yes_count} />
                  : <FormattedMessage message={this.getIntlMessage('argument.no.list')} num={this.props.opinion.arguments_no_count} />
              }
            </h4>
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            { this.renderFilter() }
          </Col>
        </Row>
        {!this.state.isLoading
          ? <ul className="media-list opinion__list">
          {
            this.state.arguments.map((argument) => {
              if ((this.props.type === 'yes' || this.props.type === 'simple') && argument.type === 1) {
                return <OpinionArgumentItem {...this.props} key={argument.id} argument={argument} />;
              }
              if (this.props.type === 'no' && argument.type === 0) {
                return <OpinionArgumentItem {...this.props} key={argument.id} argument={argument} />;
              }
            })
          }
        </ul>
        : <Loader />
      }
    </div>
    );
  },

  updateSelectedValue() {
    this.setState({
      filter: $(React.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      arguments: [],
    });
  },

  loadArgumentsFromServer() {
    this.setState({'isLoading': true});

    const baseUrl = this.props.opinion.parent ? '/versions/' : '/opinions/';
    const type = this.props.type === 'no' ? 0 : 1;
    Fetcher
      .get(`${baseUrl}${this.props.opinion.id}/arguments?type=${type}&filter=${this.state.filter}`)
      .then((data) => {
        this.setState({
          'isLoading': false,
          'arguments': data.arguments,
        });
        return true;
      });
  },

});

export default OpinionArgumentList;
