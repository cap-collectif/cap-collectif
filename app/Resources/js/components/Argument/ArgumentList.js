// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ArgumentItem from './ArgumentItem';
import Loader from '../Ui/Loader';
import type ArgumentListQueryResponse from './__generated__/ArgumentListQuery.graphql';

type Props = {
  opinion: { id: string },
  type: string,
};

type State = {
  order: string,
};

export class ArgumentList extends React.Component<Props, State> {
  state = {
    order: 'recent',
  };

  updateSelectedValue = () => {
    // $FlowFixMe
    const value = $(ReactDOM.findDOMNode(this.refs.filter)).val();
    this.setState({
      order: value,
    });
    // refetch
  };

  render() {
    const { type } = this.props;
    return (
      <div id={`opinion__arguments--${type}`} className="block--tablet block--bordered">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ArgumentListQuery($opinionId: ID!, $count: Int!, $cursor: String) {
              opinion: node(id: $opinionId) {
                ... on Opinion {
                  arguments(
                    first: $count
                    after: $cursor
                    type: FOR
                    orderBy: { field: CREATED_AT, direction: DESC }
                  ) {
                    totalCount
                    edges {
                      node {
                        id
                        type
                        ...ArgumentItem_argument
                      }
                    }
                  }
                }
              }
            }
          `}
          variables={{ opinionId: this.props.opinion.id, count: 10, cursor: null }}
          render={({ error, props }: ReadyState & { props?: ArgumentListQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              const count = props.opinion.arguments.totalCount;
              const htmlFor = `filter-arguments-${type}`;
              return (
                <React.Fragment>
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
                    {count && (
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
                          value={this.state.order}
                          onChange={this.updateSelectedValue}>
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
                    )}
                  </Row>
                  <ul className="media-list opinion__list">
                    {props.opinion.arguments.edges
                      .filter(Boolean)
                      .map(edge => edge.node)
                      .filter(Boolean)
                      .map(argument => {
                        if ((type === 'yes' || type === 'simple') && argument.type === 1) {
                          return <ArgumentItem key={argument.id} argument={argument} />;
                        }
                        if (type === 'no' && argument.type === 0) {
                          return <ArgumentItem key={argument.id} argument={argument} />;
                        }
                      })}
                  </ul>
                </React.Fragment>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

export default ArgumentList;
