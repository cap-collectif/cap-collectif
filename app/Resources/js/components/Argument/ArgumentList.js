// @flow
import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, createFragmentContainer, graphql, type ReadyState } from 'react-relay';
import Input from '../Form/Input';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ArgumentListView, { type ArgumentOrder } from './ArgumentListView';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { ArgumentListQueryResponse } from './__generated__/ArgumentListQuery.graphql';
import type { ArgumentList_argumentable } from './__generated__/ArgumentList_argumentable.graphql';
import type { GlobalState } from '../../types';

type Props = {
  argumentable: ArgumentList_argumentable,
  isAuthenticated: boolean,
  type: 'FOR' | 'AGAINST' | 'SIMPLE',
};

type State = {
  order: ArgumentOrder,
};

export class ArgumentList extends React.Component<Props, State> {
  state = {
    order: 'last',
  };

  updateOrderBy = (event: Event) => {
    this.setState({
      // $FlowFixMe
      order: event.target.value,
    });
  };

  render() {
    const { type, isAuthenticated } = this.props;
    return (
      <div id={`opinion__arguments--${type}`} className="block--tablet">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ArgumentListQuery(
              $argumentableId: ID!
              $isAuthenticated: Boolean!
              $type: ArgumentValue!
              $count: Int
              $cursor: String
              $orderBy: ArgumentOrder
            ) {
              argumentable: node(id: $argumentableId) {
                ... on Argumentable {
                  allArguments: arguments(first: 0, type: $type)
                    @connection(key: "ArgumentList_allArguments", filters: ["type"]) {
                    totalCount
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
                ...ArgumentListView_argumentable
                  @arguments(isAuthenticated: $isAuthenticated, type: $type)
              }
            }
          `}
          variables={{
            isAuthenticated,
            argumentableId: this.props.argumentable.id,
            type: type === 'SIMPLE' ? 'FOR' : type,
          }}
          render={({ error, props }: { props?: ?ArgumentListQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              const { argumentable } = props;
              if (!argumentable || !argumentable.allArguments) {
                return graphqlError;
              }
              const { totalCount } = argumentable.allArguments;
              const htmlFor = `filter-arguments-${type}`;
              return (
                <Panel className="panel--white panel-custom">
                  <Panel.Heading>
                    <Panel.Title componentClass="h4" className="opinion__header__title d-flex">
                      {type === 'SIMPLE' ? (
                        <FormattedMessage id="argument.simple.list" values={{ num: totalCount }} />
                      ) : type === 'FOR' ? (
                        <FormattedMessage id="argument.yes.list" values={{ num: totalCount }} />
                      ) : (
                        <FormattedMessage id="argument.no.list" values={{ num: totalCount }} />
                      )}
                    </Panel.Title>
                    {totalCount > 1 ? (
                      <div className="panel-heading__actions">
                        <Input
                          id={htmlFor}
                          label={
                            <span className="sr-only">
                              <FormattedMessage
                                id={`argument.filter.${type === 'AGAINST' ? 'no' : 'yes'}`}
                              />
                            </span>
                          }
                          className="form-control pull-right"
                          type="select"
                          value={this.state.order}
                          onChange={this.updateOrderBy}>
                          <FormattedMessage id="global.filter_last">
                            {(message: string) => <option value="last">{message}</option>}
                          </FormattedMessage>
                          <FormattedMessage id="global.filter_old">
                            {(message: string) => <option value="old">{message}</option>}
                          </FormattedMessage>
                          <FormattedMessage id="global.filter_popular">
                            {(message: string) => <option value="popular">{message}</option>}
                          </FormattedMessage>
                        </Input>
                      </div>
                    ) : null}
                  </Panel.Heading>
                  {/* $FlowFixMe */}
                  <ArgumentListView order={this.state.order} argumentable={argumentable} />
                </Panel>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(ArgumentList);

export default createFragmentContainer(container, {
  argumentable: graphql`
    fragment ArgumentList_argumentable on Argumentable {
      id
    }
  `,
});
