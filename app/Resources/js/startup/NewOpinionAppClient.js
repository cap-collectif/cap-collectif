// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Provider, connect } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import environment from '../createRelayEnvironment';
import NewOpinionButton from '../components/Opinion/NewOpinionButton';
import type { NewOpinionAppClientQueryVariables } from './__generated__/NewOpinionAppClientQuery.graphql';
import type { GlobalState } from '../types';

const NewOpinionAppClient = ({
  sectionId,
  consultationId,
  label,
  isAuthenticated,
}: {
  label: string,
  sectionId: string,
  consultationId: string,
  isAuthenticated: boolean,
}) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query NewOpinionAppClientQuery(
            $sectionId: ID!
            $consultationId: ID!
            $isAuthenticated: Boolean!
          ) {
            consultation: node(id: $consultationId) {
              ...NewOpinionButton_consultation @arguments(isAuthenticated: $isAuthenticated)
            }
            section: node(id: $sectionId) {
              ...NewOpinionButton_section
            }
          }
        `}
        variables={
          ({
            sectionId,
            consultationId,
            isAuthenticated,
          }: NewOpinionAppClientQueryVariables)
        }
        render={readyState => {
          if (readyState.props) {
            return (
              <NewOpinionButton
                label={label}
                consultation={readyState.props.consultation}
                section={readyState.props.section}
              />
            );
          }
          return null;
        }}
      />
    </IntlProvider>
  </Provider>
);

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: !!state.user.user,
});

export default connect(mapStateToProps)(NewOpinionAppClient);
