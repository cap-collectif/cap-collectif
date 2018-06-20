import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ArgumentStore from '../../stores/ArgumentStore';
import ArgumentActions from '../../actions/ArgumentActions';
import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/Loader';

const ArgumentList = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
  },

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
    ArgumentActions.load(opinion, this.state.type);
  },

  renderFilter() {
    const { type } = this.props;
    const { order } = this.state;
    const htmlFor = `filter-arguments-${type}`;
    if (this.state.arguments.length > 1) {
      return (
        <Col xs={12} sm={6} md={6} className="block--first-mobile">
          <label htmlFor={htmlFor}>
            <span className="sr-only">
              <FormattedMessage id={`argument.filter.${type}`} />
            </span>
          </label>
          <select
            id={htmlFor}
            ref="filter"
            className="form-control pull-right"
            value={order}
            onChange={() => this.updateSelectedValue()}>
            <FormattedMessage id="global.filter_last">
              {message => <option value="last">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_old">
              {message => <option value="old">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="global.filter_popular">
              {message => <option value="popular">{message}</option>}
            </FormattedMessage>
          </select>
        </Col>
      );
    }
  },

  render() {
    const { type } = this.props;
    const { count, isLoading } = this.state;
    return (
      <div id={`opinion__arguments--${type}`} className="block--tablet block--bordered">
        <Row className="opinion__arguments__header">
          <Col xs={12} sm={6} md={6}>
            <h4 className="opinion__header__title">
              {type === 'simple' ? (
                <FormattedMessage id="argument.simple.list" values={{ num: count }} />
              ) : type === 'yes' ? (
                <FormattedMessage id="argument.yes.list" values={{ num: count }} />
              ) : (
                <FormattedMessage id="argument.no.list" values={{ num: count }} />
              )}
            </h4>
          </Col>
          {this.renderFilter()}
        </Row>
        {!isLoading ? (
          <ul className="media-list opinion__list">
            {this.state.arguments.map(argument => {
              if ((type === 'yes' || type === 'simple') && argument.type === 1) {
                return <ArgumentItem key={argument.id} argument={argument} />;
              }
              if (type === 'no' && argument.type === 0) {
                return <ArgumentItem key={argument.id} argument={argument} />;
              }
            })}
          </ul>
        ) : (
          <Loader />
        )}
      </div>
    );
  },
});

export default ArgumentList;
