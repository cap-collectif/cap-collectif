import OpinionStore from '../../stores/OpinionStore';
import OpinionActions from '../../actions/OpinionActions';

import OpinionArgumentItem from './OpinionArgumentItem';
import Loader from '../Utils/Loader';

const FormattedMessage = ReactIntl.FormattedMessage;

const Col = ReactBootstrap.Col;
const Row = ReactBootstrap.Row;

const OpinionArgumentList = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      arguments: [],
      count: 0,
      isLoading: true,
      filter: 'last',
    };
  },

  componentWillMount() {
    OpinionStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadArgumentsFromStore();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadArguments();
    }
  },

  componentWillUnmount() {
    OpinionStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.loadArgumentsFromStore();
  },

  getNumericType() {
    return this.props.type === 'no' ? 0 : 1;
  },

  updateSelectedValue() {
    this.setState({
      filter: $(React.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      arguments: [],
    });
  },

  loadArgumentsFromStore() {
    if (!OpinionStore.isProcessing && OpinionStore.areArgumentsSync[this.getNumericType()]) {
      const args = [];
      OpinionStore.opinion.arguments.map((arg) => {
        if (arg.type === this.getNumericType()) {
          args.push(arg);
        }
      });
      if (this.state.arguments.length > 0 && this.state.arguments.length !== args.length) {
        this.setState({
          filter: 'last',
        });
      }
      this.setState({
        arguments: args,
        count: OpinionStore.opinion.arguments_count_ok,
        isLoading: false,
      });
      return;
    }

    this.loadArguments();
  },

  loadArguments() {
    this.setState({'isLoading': true});
    const type = this.getNumericType();
    OpinionActions.loadArguments(
      this.props.opinion,
      type,
      this.state.filter
    );
  },

  renderFilter() {
    if (this.state.arguments.length > 1) {
      return (
        <Col xs={12} sm={6} md={6} className="block--first-mobile">
          <label className="sr-only" htmlFor={'filter-arguments-' + this.props.type}>
            {this.getIntlMessage('argument.filter.' + this.props.type)}
          </label>
          <select id={'filter-arguments-' + this.props.type} ref="filter" className="form-control pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
            <option value="last">{this.getIntlMessage('global.filter_last')}</option>
            <option value="old">{this.getIntlMessage('global.filter_old')}</option>
            <option value="popular">{this.getIntlMessage('global.filter_popular')}</option>
          </select>
        </Col>
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
          { this.renderFilter() }
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

});

export default OpinionArgumentList;
