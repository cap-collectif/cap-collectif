import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const OpinionVersionsBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.number,
    opinionText: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      count: 0,
      versions: [],
      isLoading: true,
      filter: 'last',
      offset: 0,
      limit: 50,
    };
  },

  componentDidMount() {
    this.loadCommentsFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadCommentsFromServer();
    }
  },

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className= "row">
          <div className="col-xs-2 col-xs-offset-6">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  renderFilter() {
    if (this.state.count > 1) {
      return (
        <div className="pull-right col-xs-5 hidden-xs">
          <select ref="filter" className="form-control" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
            <option value="popular">{this.getIntlMessage('global.popular')}</option>
            <option value="last">{this.getIntlMessage('global.last')}</option>
            <option value="old">{this.getIntlMessage('global.old')}</option>
          </select>
        </div>
      );
    }
  },

  render() {
    return (
      <div>
        <div className="row">
          <OpinionVersionForm {...this.props} />
          { this.renderFilter() }
        </div>
        <div className="row">
          { this.renderLoader() }
          {!this.state.isLoading
            ? <OpinionVersionList {...this.props} versions={this.state.versions} />
            : <span />
          }
        </div>
      </div>
    );
  },

  updateSelectedValue() {
    this.setState({
        filter: $(React.findDOMNode(this.refs.filter)).val(),
        isLoading: true,
        comments: [],
    });
  },

  loadCommentsFromServer() {
    this.setState({'isLoading': true});

    Fetcher
    .get('/opinions/' + this.props.opinion +
         '/versions?offset=' + this.state.offset +
         '&limit=' + this.state.limit +
         '&filter=' + this.state.filter
    )
    .then((data) => {
      this.setState({
        'isLoading': false,
        'count': data.versions.length,
        'versions': data.versions,
      });
      return true;
    });
  },

});

export default OpinionVersionsBox;
