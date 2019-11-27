// @flow
import * as React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, createFragmentContainer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type {
  OpinionSourceBoxQueryVariables,
  OpinionSourceBoxQueryResponse,
} from '~relay/OpinionSourceBoxQuery.graphql';
import OpinionSourceListView from './OpinionSourceListView';
import OpinionSourceAdd from './OpinionSourceAdd';
import OpinionSource from './OpinionSource';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import type { OpinionSourceBox_sourceable } from '~relay/OpinionSourceBox_sourceable.graphql';
import ListGroup from '../../Ui/List/ListGroup';

type Props = {
  sourceable: OpinionSourceBox_sourceable,
  isAuthenticated: boolean,
};

type State = {
  order: 'old' | 'last' | 'popular',
};

export class OpinionSourceBox extends React.Component<Props, State> {
  state = {
    order: 'last',
  };

  handleFilterChange = (event: $FlowFixMe) => {
    this.setState({
      order: event.target.value,
    });
  };

  render() {
    const { sourceable, isAuthenticated } = this.props;
    const { order } = this.state;
    const { totalCount } = sourceable.allSources;
    return (
      <div>
        {sourceable.viewerSourcesUnpublished &&
        sourceable.viewerSourcesUnpublished.totalCount > 0 ? (
          <Panel bsStyle="danger">
            <Panel.Heading>
              <Panel.Title>
                <strong>
                  <FormattedMessage
                    id='global.sources'
                    values={{ num: sourceable.viewerSourcesUnpublished.totalCount }}
                  />
                </strong>{' '}
                <FormattedMessage id="awaiting-publication-lowercase" />
              </Panel.Title>
            </Panel.Heading>
            <ListGroup>
              {sourceable.viewerSourcesUnpublished.edges &&
                sourceable.viewerSourcesUnpublished.edges
                  .filter(Boolean)
                  .map(edge => edge.node)
                  .filter(Boolean)
                  .map(source => (
                    <OpinionSource key={source.id} source={source} sourceable={sourceable} />
                  ))}
            </ListGroup>
          </Panel>
        ) : null}
        <Panel>
          <Panel.Heading>
            <Row>
              <Col xs={12} sm={6} md={6}>
                <OpinionSourceAdd sourceable={sourceable} />
              </Col>
              {totalCount > 1 && (
                <Col xs={12} sm={6} md={6}>
                  <form className="form-inline">
                    <select
                      id="filter-opinion-source"
                      className="form-control pull-right"
                      value={order}
                      onChange={this.handleFilterChange}
                      onBlur={this.handleFilterChange}>
                      <FormattedMessage id="argument.sort.popularity">
                        {(message: string) => <option value="popular">{message}</option>}
                      </FormattedMessage>
                      <FormattedMessage id="global.filter_f_last">
                        {(message: string) => <option value="last">{message}</option>}
                      </FormattedMessage>
                      <FormattedMessage id="global.filter_f_old">
                        {(message: string) => <option value="old">{message}</option>}
                      </FormattedMessage>
                    </select>
                  </form>
                </Col>
              )}
            </Row>
          </Panel.Heading>
          <QueryRenderer
            environment={environment}
            query={graphql`
              query OpinionSourceBoxQuery(
                $sourceableId: ID!
                $isAuthenticated: Boolean!
                $count: Int!
                $cursor: String
                $orderBy: SourceOrder!
              ) {
                sourceable: node(id: $sourceableId) {
                  ...OpinionSourceListView_sourceable
                    @arguments(
                      cursor: $cursor
                      orderBy: $orderBy
                      count: $count
                      isAuthenticated: $isAuthenticated
                    )
                }
              }
            `}
            variables={
              ({
                isAuthenticated,
                cursor: null,
                count: 25,
                sourceableId: sourceable.id,
                orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
              }: OpinionSourceBoxQueryVariables)
            }
            render={({
              error,
              props,
            }: {
              props?: ?OpinionSourceBoxQueryResponse,
              ...ReactRelayReadyState,
            }) => {
              if (error) {
                return graphqlError;
              }
              if (props) {
                if (!props.sourceable) {
                  return graphqlError;
                }
                return <OpinionSourceListView order={order} sourceable={props.sourceable} />;
              }
              return <Loader />;
            }}
          />
        </Panel>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionSourceBox, {
  sourceable: graphql`
    fragment OpinionSourceBox_sourceable on Sourceable
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...OpinionSourceAdd_sourceable @arguments(isAuthenticated: $isAuthenticated)
      ...OpinionSource_sourceable @arguments(isAuthenticated: $isAuthenticated)
      allSources: sources(first: 0) {
        totalCount
      }
      viewerSourcesUnpublished(first: 100)
        @include(if: $isAuthenticated)
        @connection(key: "OpinionSourceBox_viewerSourcesUnpublished") {
        totalCount
        edges {
          node {
            id
            ...OpinionSource_source
          }
        }
      }
    }
  `,
});
