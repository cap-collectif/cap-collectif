// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import { FormattedHTMLMessage } from 'react-intl';
import { Alert, Glyphicon } from 'react-bootstrap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Loader from '../Ui/Loader';
import type {
  OpinionPageQueryVariables,
  OpinionPageQueryResponse,
} from './__generated__/OpinionPageQuery.graphql';

type Props = {
  opinionId?: string,
  versionId?: string,
};

export class OpinionPage extends React.Component<Props> {
  render() {
    const { opinionId, versionId } = this.props;
    const id = opinionId || versionId;
    if (!id) {
      return null;
    }
    return (
      <div className="has-chart">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query OpinionPageQuery($opinionId: ID!) {
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
                ...OpinionBox_opinion
                ...OpinionTabs_opinion
              }
            }
          `}
          variables={
            ({
              opinionId: id,
            }: OpinionPageQueryVariables)
          }
          render={({ error, props }: ReadyState & { props?: ?OpinionPageQueryResponse }) => {
            if (error) {
              return graphqlError;
            }
            if (props) {
              const opinion = props.opinion;
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
                  <OpinionBox rankingThreshold={0} opinionTerm={0} opinion={opinion} />
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
