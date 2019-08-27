// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedHTMLMessage } from 'react-intl';
import { Alert, Glyphicon } from 'react-bootstrap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type {
  OpinionPageQueryVariables,
  OpinionPageQueryResponse,
} from '~relay/OpinionPageQuery.graphql';

export type Props = {
  opinionId?: string,
  versionId?: string,
  isAuthenticated: boolean,
};

export class OpinionPage extends React.Component<Props> {
  render() {
    const { opinionId, versionId, isAuthenticated } = this.props;
    const id = opinionId || versionId;
    if (!id) {
      return null;
    }
    return (
      <div className="has-chart">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query OpinionPageQuery($opinionId: ID!, $isAuthenticated: Boolean!) {
              opinion: node(id: $opinionId) {
                ... on Opinion {
                  id
                  trashed
                  trashedReason
                }
                ... on Version {
                  id
                  trashed
                  trashedReason
                }
                ...OpinionBox_opinion @arguments(isAuthenticated: $isAuthenticated)
                ...OpinionTabs_opinion @arguments(isAuthenticated: $isAuthenticated)
              }
            }
          `}
          variables={
            ({
              opinionId: id,
              isAuthenticated,
            }: OpinionPageQueryVariables)
          }
          render={({ error, props }: { props?: ?OpinionPageQueryResponse, ...ReadyState }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              const { opinion } = props;
              if (!opinion) {
                return graphqlError;
              }
              return (
                <div>
                  {opinion.trashed && (
                    <Alert bsStyle="danger">
                      <Glyphicon glyph="trash" />{' '}
                      <FormattedHTMLMessage
                        id="in-the-trash"
                        values={{ reason: opinion.trashedReason || '' }}
                      />
                    </Alert>
                  )}
                  {/* $FlowFixMe */}
                  <OpinionBox rankingThreshold={0} opinionTerm={0} opinion={opinion} />
                  {/* $FlowFixMe */}
                  <OpinionTabs opinion={opinion} />
                </div>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

export default OpinionPage;
