import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { IntlMixin, FormattedMessage } from 'react-intl';
import ArgumentStore from '../../stores/ArgumentStore';
import ArgumentActions from '../../actions/ArgumentActions';
import ArgumentItem from './ArgumentItem';
import Loader from '../Utils/Loader';
import DeepLinkStateMixin from '../../utils/DeepLinkStateMixin';

const ArgumentList = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getInitialState() {
    return {
      arguments: [],
      count: 0,
      isLoading: true,
      order: ArgumentStore.orderByType[this.getNumericType()],
      type: this.getNumericType(),
    };
  },

  componentWillMount() {
    ArgumentStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadArguments();
  },

  componentWillUnmount() {
    ArgumentStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (ArgumentStore.orderByType[this.state.type] === this.state.order) {
      this.setState({
        arguments: ArgumentStore.arguments[this.state.type],
        count: ArgumentStore.countByType[this.state.type],
        order: ArgumentStore.orderByType[this.state.type],
        isLoading: false,
      });
      return;
    }
    this.setState({
      order: ArgumentStore.orderByType[this.state.type],
      isLoading: true,
    });
    this.loadArguments();
  },

  getNumericType() {
    const { type } = this.props;
    return type === 'no' ? 0 : 1;
  },

  updateSelectedValue() {
    const value = $(ReactDOM.findDOMNode(this.refs.filter)).val();
    ArgumentActions.changeSortOrder(this.state.type, value);
  },

  loadArguments() {
    const { opinion } = this.props;
    ArgumentActions.load(
      opinion,
      this.state.type
    );
  },

  renderFilter() {
    const { type } = this.props;
    if (this.state.arguments.length > 1) {
      return (
        <Col xs={12} sm={6} md={6} className="block--first-mobile">
          <label className="sr-only" htmlFor={`filter-arguments-${type}`}>
            {this.getIntlMessage(`argument.filter.${type}`)}
          </label>
          <select id={`filter-arguments-${type}`} ref="filter" className="form-control pull-right" value={this.state.order} onChange={() => this.updateSelectedValue()}>
            <option value="last">{this.getIntlMessage('global.filter_last')}</option>
            <option value="old">{this.getIntlMessage('global.filter_old')}</option>
            <option value="popular">{this.getIntlMessage('global.filter_popular')}</option>
          </select>
        </Col>
      );
    }
  },

  render() {
    const { type } = this.props;
    return (
      <div id={`opinion__arguments--${type}`} className="block--tablet block--bordered">
        <Row className="opinion__arguments__header">
          <Col xs={12} sm={6} md={6}>
            <h4 className="opinion__header__title">
              {type === 'simple'
                ? <FormattedMessage message={this.getIntlMessage('argument.simple.list')} num={this.state.count} />
                : type === 'yes'
                  ? <FormattedMessage message={this.getIntlMessage('argument.yes.list')} num={this.state.count} />
                  : <FormattedMessage message={this.getIntlMessage('argument.no.list')} num={this.state.count} />
              }
            </h4>
          </Col>
          { this.renderFilter() }
        </Row>
        {!this.state.isLoading
          ? <ul className="media-list opinion__list">
            {
              this.state.arguments.map((argument) => {
                if ((type === 'yes' || type === 'simple') && argument.type === 1) {
                  return <ArgumentItem key={argument.id} argument={argument} />;
                }
                if (type === 'no' && argument.type === 0) {
                  return <ArgumentItem key={argument.id} argument={argument} />;
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

export default ArgumentList;
