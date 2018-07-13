// @flow
import * as React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type {
  OpinionSourceBoxQueryVariables,
  OpinionSourceBoxQueryResponse,
} from './__generated__/OpinionSourceBoxQuery.graphql';
import OpinionSourceListView from './OpinionSourceListView';
import OpinionSourceAdd from './OpinionSourceAdd';
import Loader from '../../Ui/Loader';
import Filter from '../../Utils/Filter';

type Props = {
  opinion: { id: string },
  isAuthenticated: boolean,
};

type State = {
  sources: Array<$FlowFixMe>,
  isLoading: boolean,
  filter: $FlowFixMe,
};

class OpinionSourceBox extends React.Component<Props, State> {
  state = {
    sources: [],
    isLoading: true,
    filter: OpinionSourceStore.filter,
  };

  componentWillMount() {
    OpinionSourceStore.addChangeListener(this.onChange);
  }

  componentDidMount() {
    this.loadSourcesFromServer();
    this.loadCategoriesFromServer();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.filter !== prevState.filter) {
      this.loadSourcesFromServer();
    }
  }

  componentWillUnmount() {
    OpinionSourceStore.removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      sources: OpinionSourceStore.sources,
      filter: OpinionSourceStore.filter,
      isLoading: false,
    });
  };

  handleFilterChange = (event: $FlowFixMe) => {
    this.setState({
      filter: event.target.value,
    });
  };

  loadSourcesFromServer = () => {
    const { opinion } = this.props;
    this.setState({ isLoading: true });
    OpinionSourceActions.load(opinion, this.state.filter);
  };

  handleFilterChange = (event: $FlowFixMe) => {
    this.setState({
      order: event.target.value,
    });
  };

  render() {
    const { opinion } = this.props;
    const { sources, isLoading, filter } = this.state;
    return (
      <div>
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
                ... on Sourceable {
                  ...OpinionSourceAdd_sourceable
                  contribuable
                  allSources: sources(first: 0)
                    @connection(key: "OpinionSourceBox_allSources", filters: []) {
                    totalCount
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
                ...OpinionSourceListView_sourceable
                  @arguments(orderBy: $orderBy, count: $count, isAuthenticated: $isAuthenticated)
              }
            }
          `}
          variables={
            ({
              isAuthenticated,
              cursor: null,
              count: 25,
              sourceableId: opinion.id,
              orderBy: { field: 'CREATED_AT', direction: 'DESC' },
            }: OpinionSourceBoxQueryVariables)
          }
          render={({ error, props }: ReadyState & { props?: ?OpinionSourceBoxQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              const sourceable = props.sourceable;
              if (!sourceable || !sourceable.allSources) {
                return graphqlError;
              }
              const totalCount = sourceable.allSources.totalCount;
              return (
                <Panel>
                  <Panel.Heading>
                    <Row>
                      <Col xs={12} sm={6} md={6}>
                        <OpinionSourceAdd sourceable={sourceable} />
                      </Col>
                      {totalCount > 1 && (
                        <Col xs={12} sm={6} md={6}>
                          <Filter show value={order} onChange={this.handleFilterChange} />
                        </Col>
                      )}
                    </Row>
                  </Panel.Heading>
                  {/* $FlowFixMe */}
                  <OpinionSourceListView order={order} sourceable={sourceable} />
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

export default OpinionSourceBox;
