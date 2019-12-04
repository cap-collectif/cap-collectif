// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Section from './Section';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { SectionPageQueryResponse } from '~relay/SectionPageQuery.graphql';
import type { GlobalState } from '../../types';

export type Props = {|
  +sectionId: string,
  +isAuthenticated: boolean,
|};

const render = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?SectionPageQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    if (props.section && props.section.consultation) {
      return (
        <>
          <Section
            enablePagination
            level={0}
            section={props.section}
            consultation={props.section.consultation}
          />
        </>
      );
    }
    return graphqlError;
  }
  return <Loader />;
};

export class SectionPage extends React.Component<Props> {
  render() {
    const { sectionId, isAuthenticated } = this.props;

    return (
      <div className="row">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query SectionPageQuery($sectionId: ID!, $isAuthenticated: Boolean!) {
              section: node(id: $sectionId) {
                id
                ... on Section {
                  consultation {
                    ...Section_consultation @arguments(isAuthenticated: $isAuthenticated)
                  }
                }
                ...Section_section
              }
            }
          `}
          variables={{
            sectionId,
            isAuthenticated,
          }}
          render={render}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
});

export default connect(mapStateToProps)(SectionPage);
