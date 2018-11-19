// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import environment from '../createRelayEnvironment';
import NewOpinionButton from '../components/Opinion/NewOpinionButton';

export default ({
  sectionId,
  consultationId,
  label,
}: {
  label: string,
  sectionId: string,
  consultationId: string,
}) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query NewOpinionAppClientQuery($sectionId: ID!, $consultationId: ID!) {
            consultation: node(id: $consultationId) {
              ...NewOpinionButton_consultation
            }
            section: node(id: $sectionId) {
              ...NewOpinionButton_section
            }
          }
        `}
        variables={{
          sectionId,
          consultationId,
        }}
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
