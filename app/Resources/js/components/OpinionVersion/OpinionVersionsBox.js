// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { QueryRenderer, createFragmentContainer, graphql } from 'react-relay';
import { Row, Col, Panel } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import environment, { graphqlError } from '../../createRelayEnvironment';
import OpinionVersionListView, { type VersionOrder } from './OpinionVersionListView';
import OpinionVersionCreateButton from './OpinionVersionCreateButton';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import OpinionVersion from './OpinionVersion';
import OpinionVersionCreateModal from './OpinionVersionCreateModal';
import type {
  OpinionVersionsBoxQueryVariables,
  OpinionVersionsBoxQueryResponse,
} from '~relay/OpinionVersionsBoxQuery.graphql';
import type { OpinionVersionsBox_opinion } from '~relay/OpinionVersionsBox_opinion.graphql';
import ListGroup from '../Ui/List/ListGroup';

type Props = {
  opinion: OpinionVersionsBox_opinion,
  isAuthenticated: boolean,
};

type State = {
  order: VersionOrder,
};

export class OpinionVersionsBox extends React.Component<Props, State> {
  state = {
    order: 'last',
  };

  updateSelectedValue = () => {
    const element = ReactDOM.findDOMNode(this.refs.filter);
    if (element instanceof Element) {
      this.setState({
        order: $(element).val(),
      });
    }
  };

  renderFilter = () => {
    const { opinion } = this.props;
    const { order } = this.state;

    if (opinion.allVersions.totalCount > 1) {
      return (
        <form className="form-inline">
          <label htmlFor="filter-opinion-version" className="control-label sr-only">
            <FormattedMessage id="opinion.version.filter" />
          </label>
          <select
            id="filter-opinion-version"
            ref="filter"
            className="form-control pull-right"
            value={order}
            onBlur={() => this.updateSelectedValue()}
            onChange={() => this.updateSelectedValue()}>
            <FormattedMessage id="global.filter_random">
              {(message: string) => <option value="random">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="opinion.sort.last">
              {(message: string) => <option value="last">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="opinion.sort.old">
              {(message: string) => <option value="old">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="opinion.sort.favorable">
              {(message: string) => <option value="favorable">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="opinion.sort.votes">
              {(message: string) => <option value="votes">{message}</option>}
            </FormattedMessage>
            <FormattedMessage id="opinion.sort.comments">
              {(message: string) => <option value="comments">{message}</option>}
            </FormattedMessage>
          </select>
        </form>
      );
    }
  };

  render() {
    const { isAuthenticated, opinion } = this.props;
    return (
      <div>
        {opinion.viewerVersionsUnpublished && opinion.viewerVersionsUnpublished.totalCount > 0 ? (
          <Panel bsStyle="danger">
            <Panel.Heading>
              <Panel.Title>
                <strong>
                  <FormattedMessage
                    id="count-amendments"
                    values={{ num: opinion.viewerVersionsUnpublished.totalCount }}
                  />
                </strong>{' '}
                <FormattedMessage id="awaiting-publication-lowercase" />
              </Panel.Title>
            </Panel.Heading>
            <ListGroup>
              {opinion.viewerVersionsUnpublished.edges &&
                opinion.viewerVersionsUnpublished.edges
                  .filter(Boolean)
                  .map(edge => edge.node)
                  .filter(Boolean)
                  .map(version => <OpinionVersion key={version.id} version={version} />)}
            </ListGroup>
          </Panel>
        ) : null}
        <Panel>
          <Panel.Heading>
            <OpinionVersionCreateModal opinion={opinion} />
            <Row>
              <Col xs={12} sm={6} md={6}>
                <OpinionVersionCreateButton opinion={opinion} />
              </Col>
              <Col xs={12} sm={6} md={6} className="block--first-mobile">
                {this.renderFilter()}
              </Col>
            </Row>
          </Panel.Heading>
          <QueryRenderer
            environment={environment}
            query={graphql`
              query OpinionVersionsBoxQuery(
                $opinionId: ID!
                $isAuthenticated: Boolean!
                $count: Int!
                $cursor: String
                $orderBy: VersionOrder!
              ) {
                opinion: node(id: $opinionId) {
                  ...OpinionVersionListView_opinion
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
                opinionId: opinion.id,
                orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
              }: OpinionVersionsBoxQueryVariables)
            }
            render={({
              error,
              props,
            }: {
              props?: ?OpinionVersionsBoxQueryResponse,
              ...ReactRelayReadyState,
            }) => {
              if (error) {
                return graphqlError;
              }
              if (props) {
                if (!props.opinion) {
                  return graphqlError;
                }
                const { order } = this.state;
                return <OpinionVersionListView order={order} opinion={props.opinion} />;
              }
              return <Loader />;
            }}
          />
        </Panel>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionVersionsBox, {
  opinion: graphql`
    fragment OpinionVersionsBox_opinion on Opinion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...OpinionVersionCreateModal_opinion
      ...OpinionVersionCreateButton_opinion
      allVersions: versions(first: 0) {
        totalCount
      }
      viewerVersionsUnpublished(first: 100) @include(if: $isAuthenticated) {
        totalCount
        edges {
          node {
            id
            ...OpinionVersion_version
          }
        }
      }
    }
  `,
});
