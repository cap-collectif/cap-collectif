// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';

import type { FeatureToggles, State as GlobalState } from '~/types';
import type { LanguageButtonContainerQueryResponse } from '~relay/LanguageButtonContainerQuery.graphql';

import LanguageButtonWrapper from './LanguageButtonWrapper';

type Props = {|
  features: FeatureToggles,
|};

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
    const { availableLocales } = props;
    return availableLocales && <LanguageButtonWrapper languages={availableLocales} />;
  }

  return null;
};

export const LanguageButtonContainer = ({ features }: Props) => {
  if (!features.multilangue) {
    return null;
  }

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

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(LanguageButtonContainer);
