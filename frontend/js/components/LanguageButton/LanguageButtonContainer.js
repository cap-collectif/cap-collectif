// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';

import type { LanguageButtonContainerQueryResponse } from '~relay/LanguageButtonContainerQuery.graphql';

import LanguageButtonWrapper from './LanguageButtonWrapper';

const component = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?LanguageButtonContainerQueryResponse,
}) => {
  if (error) {
    return graphqlError;
  }
  if (props) {
    return props.availableLocales && <LanguageButtonWrapper languages={props.availableLocales} />;
  }

  return null;
};

export const LanguageButtonContainer = () => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query LanguageButtonContainerQuery {
          availableLocales(includeDisabled: false) {
            ...LanguageButtonWrapper_languages
          }
        }
      `}
      variables={{}}
      render={component}
    />
  );
};

export default LanguageButtonContainer;
