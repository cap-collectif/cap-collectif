// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import ArgumentStore from '../../stores/ArgumentStore';
import ArgumentActions from '../../actions/ArgumentActions';
import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/Loader';

type Props = {
  opinion: Object,
  type: string,
};

type State = {
  arguments: Array<$FlowFixMe>,
  order: $FlowFixMe,
  type: number,
};

const renderList = () => {
  <ul className="media-list opinion__list">
    {opinion.arguments.map(argument => {
      if ((type === 'yes' || type === 'simple') && argument.type === 1) {
        return <ArgumentItem key={argument.id} argument={argument} />;
      }
      if (type === 'no' && argument.type === 0) {
        return <ArgumentItem key={argument.id} argument={argument} />;
      }
    })}
  </ul>
  <Loader />
}

export class ArgumentList extends React.Component<Props, State> {
  state = {
    order: ArgumentStore.orderByType[this.getNumericType()],
    type: this.getNumericType(),
  };

  // onChange = () => {
  //   if (ArgumentStore.orderByType[this.state.type] === this.state.order) {
  //     this.setState({
  //       arguments: ArgumentStore.arguments[this.state.type],
  //       count: ArgumentStore.countByType[this.state.type],
  //       order: ArgumentStore.orderByType[this.state.type],
  //     });
  //     return;
  //   }
  //   this.setState({
  //     order: ArgumentStore.orderByType[this.state.type],
  //   });
  //   this.loadArguments();
  // };

  getNumericType() {
    const { type } = this.props;
    return type === 'no' ? 0 : 1;
  }

  updateSelectedValue() {
    // $FlowFixMe
    const value = $(ReactDOM.findDOMNode(this.refs.filter)).val();
    ArgumentActions.changeSortOrder(this.state.type, value);
  }

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
  }

  render() {
    const { type } = this.props;
    const count = 0;
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
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ArgumentListQuery(
              $opinionId: ID!
              $cursor: String
            ) {
              opinion: node(id: $opinionId) {
                arguments(type: FOR) {
                  id
                  type
                  ...ArgumentItem_argument
                }
              }
            }
          `}
          variables={{ opinionId: opinion.id, count: 10, cursor: null }}
          render={renderList}
        />
      </div>
    );
  }
}

export default ArgumentList;
